var Server = require('ws').Server;
var port = process.env.PORT || 9030;
var ws = new Server({port: port});
const DataBase = require("./DataBaseHelper.js")
const StockHelper = require("./StockPrice.js")
var SubscribedStocks = {} 
var SocketStocks = {}
var SC = require("./ServerConfig.json");
const { GridFSBucketReadStream } = require('mongodb');

function GetSboxPrice() {
  return Math.floor(Math.random() * 100)
}

const interval = SC["Stockprice"]["Interval"]
const PriceType = SC["Stockprice"]["Prices"]

async function GetStockPrice(stock)
{
  if (PriceType == "Sandbox"){
      return GetSboxPrice();
    }
    else {
      // TODO: Implement live stock price from APIS.
      //stockPrice = await StockHelper.GetStockPrice(stock) 
    }
}

setInterval(async () => {
  var tableOut = {}
  for (let s in SubscribedStocks){
    if (SubscribedStocks[s].length != 0){
      var stockPrice = await GetStockPrice(s)
      var stockMSG = {
        MessageType : "StockPrice",
        Price : stockPrice
      }
      for (let index = 0; index < SubscribedStocks[s].length; index++) {
        SubscribedStocks[s][index].send(JSON.stringify(stockMSG))
      }
      tableOut[s] = {Subscribers : SubscribedStocks[s].length, "Current Price" : stockPrice}
    }
  }
  console.clear();
  console.table(tableOut)
}, interval);


ws.on('connection', function(w){
  w.on('message', async function(msg){
    msg = JSON.parse(msg)
    var MessageType = msg["MessageType"];
    if (MessageType == "Init"){
      await InitMessage(w, msg)
    }
    else if (MessageType == "ChangeSubscription"){
      await ChangeSubscription(w,msg);
    }else if (MessageType == "BuyStock") {
      await BuyStock(w, msg)
    }
  });
  
  w.on('close', function() {
    var subbedStock = SocketStocks[w]
    const index = SubscribedStocks[subbedStock].indexOf(w);
      if (index > -1) {
        SubscribedStocks[subbedStock].splice(index, 1);
      }
  });

});

async function BuyStock(w, data){
  var IsAuthed = await DataBase.CheckSession(data["Auth"], true);
  if (!IsAuthed){
    // Not authed
    return;
  }
  var subbedStock = SocketStocks[w];
  var price = GetSboxPrice();
  var didBuy = await DataBase.BuyStock(parseInt(data['Amount']), subbedStock, IsAuthed[1], price);
}

async function InitMessage(w, msg) {
  var authed = false;
  var holdings = [];
  if (msg['Auth'] != null){ 
    holdings = await DataBase.GetInitialData(msg['Auth'], w);
    if (holdings["authed"] != false){
      authed = true;
      holdings = holdings["holdings"]
    }
  }
  else{
    authed = false;
  }
  var Stock = msg["Stock"];
  AddSubscription(msg, w, Stock);
  var stockPrice = await GetStockPrice(Stock)
  var data = await BuildInitReturnMsg(stockPrice, holdings);
  w.send(JSON.stringify(data))
}

async function BuildInitReturnMsg(stockPrice, holdings=null, authed) {
  var data = {
    MessageType : "InitRes",
    Authed : authed,
    Holdings : holdings,
    Price : stockPrice
  }
  return data;
}
async function ChangeSubscription(w,msg){
  RemoveCurrentSubscription(w);
  AddSubscription(msg, w, msg["Stock"]);
  var stockPrice = await GetStockPrice(msg["Stock"])
  var data = await BuildNewSubReturnMsg(stockPrice)
  w.send(JSON.stringify(data))
}

async function BuildNewSubReturnMsg(stockPrice){
  var data = {
    MessageType : "StockPrice",
    Price : stockPrice
  }
  return data;
}


function RemoveCurrentSubscription(w){
  var CurrentSub = SocketStocks[w]
  var ScoketIndex= SubscribedStocks[CurrentSub].indexOf(w);
  if (ScoketIndex > -1) {
    SubscribedStocks[CurrentSub].splice(ScoketIndex, 1);
  }
}


function AddSubscription(msg, w, stock) {
  SocketStocks[w] = stock;
  if (stock in SubscribedStocks){
    SubscribedStocks[stock].push(w)  
  }
  else {
    SubscribedStocks[stock] = [w]
  }
}