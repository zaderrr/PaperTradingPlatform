var Server = require('ws').Server;
var port = process.env.PORT || 9030;
var ws = new Server({port: port});
const DataBase = require("./DataBaseHelper.js")
const StockHelper = require("./StockPrice.js")
var SubscribedStocks = {} 
var SocketStocks = {}

function GetSboxPrice() {
  return stockPrice = Math.floor(Math.random() * 100)
}
setInterval(async () => {
  var tableOut = {}
  for (let s in SubscribedStocks){
    if (SubscribedStocks[s].length != 0){
      if (process.argv[2] != "sbox"){
      stockPrice = await StockHelper.GetStockPrice(s) 
      }
      else {
        stockPrice = GetSboxPrice();
      }
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
}, 5000);


ws.on('connection', function(w){
  w.on('message', async function(msg){
    msg = JSON.parse(msg)
    var MessageType = msg["MessageType"];
    if (MessageType == "Init"){
      await InitMessage(w, msg)
    }
    else if (MessageType == "ChangeSubscription"){
      await ChangeSubscription(w,msg);
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

async function InitMessage(w, msg) {
  var Funds = await DataBase.GetInitialData(msg['SessionAuth']);
  var Stock = msg["Stock"];
  AddSubscription(msg, w, Stock);
  if (process.argv[2] != "sbox"){
  var stockPrice = await StockHelper.GetStockPrice(Stock); 
  }else{
    var stockPrice = GetSboxPrice();
  }
  var data = await BuildInitReturnMsg(stockPrice, Funds);
  w.send(JSON.stringify(data))
}

async function BuildInitReturnMsg(stockPrice, Funds ) {
  var data = {
    MessageType : "InitRes",
    CashFunds : Funds,
    Price : stockPrice
  }
  return data;
}
async function ChangeSubscription(w,msg){
  RemoveCurrentSubscription(w);
  AddSubscription(msg, w, msg["Stock"]);
  if (process.argv[2] != "sbox"){
    var stockPrice = await StockHelper.GetStockPrice(Stock); 
    }else{
      var stockPrice = GetSboxPrice();
  }
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