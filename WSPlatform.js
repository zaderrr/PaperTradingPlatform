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
    var res = await StockHelper.GetPriceData(stock);
    return res["quoteResponse"]["result"][0]["regularMarketPrice"];
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
  var rtrnMsg = {}
  if (!await IsAuthed(data['Auth'] || data["Amount"] == "" || data["Amount"] <= 0)){
    CannotOrderStock(w, 401)
    return;
  }
  var subbedStock = data["Stock"];
  var price = StockPrices[subbedStock]
  var holdings = await DataBase.OrderStock(parseInt(data["Amount"]), subbedStock, price, method, data['Auth']);
  var Status = 0
  if (holdings[1] == true){
    Status = 200;
  }
  holdings = await UpdateHoldingsWithCurrentWorth(holdings[0])
  rtrnMsg = {
    MessageType : "OrderRes",
    Status : Status,
    Holdings : holdings
  }
  w.send(JSON.stringify(rtrnMsg));
}

async function InitMessage(w, msg) {
  var authed = false;
  var Holdings = [];
  var Trades = [];
  if (await IsAuthed(msg['Auth'])){ 
    var ReturnInformation = await DataBase.GetInitialMessageReturnInfo(msg['Auth']);
    Holdings = await UpdateHoldingsWithCurrentWorth(ReturnInformation[0])
    authed = true;
  }
  var ResponseRawData = await DataResponseForSubscription(w,msg);
  var data = await BuildInitReturnMsg(ResponseRawData, authed, Holdings,ReturnInformation[1]);
  w.send(JSON.stringify(data))
}

async function UpdateHoldingsWithCurrentWorth(holdings) {
  for (let index = 0; index < holdings.length; index++) {
    var stock = holdings[index].Instrument
    if (stock != "Cash"){
      var price = await GetStockPrice(stock);
      var worth = (price * holdings[index].Amount).toFixed(2);
      holdings[index]["CurrentWorth"] = worth
    }
  }
  return holdings
}

async function IsAuthed(Auth){
  return Auth != null && await DataBase.IsUserAuthed(Auth)
}

function CannotOrderStock(w, status){
  var rtnMsg = {
    MessageType : "OrderRes",
    Status : 401
  }
  w.send(JSON.stringify(rtrnMsg));
}

async function BuildInitReturnMsg(RawData, authed,Holdings=null, Trades=null) {
  
  var data = {
    MessageType : "InitRes",
    Authed : authed,
    Holdings : Holdings,
    PrevData : RawData["StockHistory"],
    Price : RawData["StockPrice"],
    Trades : Trades
  }
  return data;
}


async function ChangeSubscription(w,msg){
  RemoveCurrentSubscription(w);
  var ResponseRawData = await DataResponseForSubscription(w,msg);
  var data = await BuildNewSubReturnMsg(ResponseRawData)
  w.send(JSON.stringify(data))
}

async function DataResponseForSubscription(w,msg){
  var Stock = msg["Stock"]
  await AddSubscription(w, Stock);
  var StockHistory = await StockHelper.GetChartData(Stock);
  var stockPrice = StockPrices[Stock];
  return {"Stock" : Stock, StockHistory : StockHistory, StockPrice : stockPrice}
}

async function BuildNewSubReturnMsg(RawData){
  var data = {
    MessageType : "ChangeSub",
    Price : RawData["StockPrice"],
    PrevData :  RawData["StockHistory"]
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


async function AddSubscription(w, stock) {
  SocketStocks[w] = stock;
  if (stock in SubscribedStocks){
    SubscribedStocks[stock].push(w)  
  }
  else {
    SubscribedStocks[stock] = [w]
    StockPrices[stock] = await GetStockPrice(stock);
  }
}