var Server = require('ws').Server;
var port = process.env.PORT || 9030;
var ws = new Server({port: port});
const DataBase = require("./DataBaseHelper.js")
const StockHelper = require("./StockPrice.js")
var SC = require("./ServerConfig.json");
const { GridFSBucketReadStream } = require('mongodb');


var SubscribedStocks = {} 
var SocketStocks = {}
var StockPrices = {}
const interval = SC["Stockprice"]["Interval"]
const PriceType = SC["Stockprice"]["Prices"]

function GetSboxPrice() {
  return Math.floor(Math.random() * 100)
}



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
      var stockPrice = await GetStockPrice(s);
      StockPrices[s] = stockPrice;
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
    }else if (MessageType == "OrderStock") {
      await OrderStock(w, msg)
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

async function OrderStock(w, data){
  var method = data["Method"] 
  var IsAuthed = await DataBase.CheckSession(data["Auth"], true);
  
  rtrnMsg = {}
  if (!IsAuthed){
    rtrnMsg = {
      MessageType : "OrderRes",
      Status : IsAuthed
    }
    w.send(JSON.stringify(data));
    return;
  }
  
  var subbedStock = data["Stock"];
  var price = StockPrices[subbedStock]
  var holdings = await DataBase.OrderStock(parseInt(data["Amount"]), subbedStock, IsAuthed[1], price, method);
  rtrnMsg = {
    MessageType : "OrderRes",
    Status : holdings[1],
    Holdings : holdings[0]
  }
  w.send(JSON.stringify(rtrnMsg));
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
  var StockHistory = await StockHelper.GetStockPrice(Stock);
  AddSubscription(msg, w, Stock);
  var stockPrice = StockPrices[Stock];
  StockHistory = BuildStockHistoryMsg(StockHistory)
  var data = await BuildInitReturnMsg(stockPrice, holdings,authed, StockHistory);
  w.send(JSON.stringify(data))
}

function BuildStockHistoryMsg(StockHistory){
  var points = StockHistory["chart"]["result"][0]["timestamp"].length;
  var data = []
  for (let index = 0; index < points; index++) {
    var period = {
      "Time" : StockHistory["chart"]["result"][0]["timestamp"][index],
      "Open" : StockHistory["chart"]["result"][0]["indicators"]["quote"][0]["open"][index].toFixed(2),
      "Close" : StockHistory["chart"]["result"][0]["indicators"]["quote"][0]["close"][index].toFixed(2),
      "High" : StockHistory["chart"]["result"][0]["indicators"]["quote"][0]["high"][index].toFixed(2),
      "Low" : StockHistory["chart"]["result"][0]["indicators"]["quote"][0]["low"][index].toFixed(2),
      "Volume" : StockHistory["chart"]["result"][0]["indicators"]["quote"][0]["volume"][index]
    }
    data.push(period)
    
  }

  return data
}

async function BuildInitReturnMsg(stockPrice, holdings=null, authed, hist) {

  var data = {
    MessageType : "InitRes",
    Authed : authed,
    Holdings : holdings,
    PrevData : hist,
    Price : stockPrice
  }
  return data;
}

async function GetRandomHistory(){
 var data = [Math.floor(Math.random() * 20),Math.floor(Math.random() * 20),Math.floor(Math.random() * 20),Math.floor(Math.random() * 20),Math.floor(Math.random() * 20),Math.floor(Math.random() * 20),Math.floor(Math.random() * 20)]
  return data
}

async function ChangeSubscription(w,msg){
  RemoveCurrentSubscription(w);
  AddSubscription(msg, w, msg["Stock"]);
  var stockPrice = await StockPrices[msg["Stock"]]
  var StockHistory = await StockHelper.GetStockPrice(msg["Stock"]);
  StockHistory = BuildStockHistoryMsg(StockHistory)
  var data = await BuildNewSubReturnMsg(stockPrice,StockHistory)
  w.send(JSON.stringify(data))
}



async function BuildNewSubReturnMsg(stockPrice, hist){
  var data = {
    MessageType : "ChangeSub",
    Price : stockPrice,
    PrevData :  hist
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
    StockPrices[stock] = GetSboxPrice();
  }
}