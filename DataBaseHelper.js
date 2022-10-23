const { MongoClient } = require('mongodb');
const bcrypt = require("bcryptjs");
const sqlite3 = require('sqlite3').verbose();
const { json } = require('express/lib/response');
const sql = require('sqlite');


async function CreateDB()
{
  const db = new sqlite3.Database('PLATFORM.db');
  db.serialize(() => {
    db.run("CREATE TABLE Users (USER_ID INTEGER PRIMARY KEY AUTOINCREMENT,Name TEXT, Password TEXT) ");  
    db.run("CREATE TABLE Auth (FK_USER_ID INTEGER NOT NULL, Token varchar(255))"); 
    db.run("CREATE TABLE Trades (TRADE_ID INTEGER PRIMARY KEY AUTOINCREMENT, FK_USER_ID INTEGER NOT NULL, Instrument varchar(255) NOT NULL, Amount REAL NOT NULL, Cost REAL NOT NULL)"); 
    db.run("CREATE TABLE Holdings(FK_USER_ID INTEGER NOT NULL, Instrument varchar(255) NOT NULL, Amount REAL NOT NULL, Average_Price	REAL)");
  });
db.close();
}


// Checks database for Auth Token
async function CheckSession (SessionID, NeedUserId=null){
    var client = await ConnectDatabase();
    var found = await IsValidAuth(SessionID, client, NeedUserId);
    client.close();
    return found;
}
  
// Find auths with matching tokens. Will return undefined if none exist.
async function IsValidAuth(SessionID, client, NeedUserId=null)
{
  var authFound = await client.get("SELECT * FROM Auth WHERE Token=?", SessionID);
  if (authFound == undefined){
      return false;
  }else{
    if (NeedUserId != null){
      return ([true,authFound.FK_USER_ID])
    }
    return true
  }
}

async function OrderStock(Amount,Stock,UserID,price, method){
  var client = await ConnectDatabase();
  var stockHoldings = await client.all("SELECT * FROM Holdings WHERE FK_USER_ID=?",[UserID]);
  var Holdings = {}
  stockHoldings.forEach(holding => {
    Holdings[holding["Instrument"]] = holding;
  });
  var totalPrice = price * Amount
  var CanOrder = false
  
  if (method == "Buy"){
    if (Holdings["Cash"]["Amount"] >= totalPrice){
      CanOrder = true;
    }
  }else if (method == "Sell"){
    if (Holdings[Stock] != undefined && Holdings[Stock]["Amount"] >= Amount && Amount >=1){CanOrder = true;}
  }else{
    return undefined;
  }
  if (CanOrder){
    if (method == "Buy"){
      await client.run("UPDATE HOLDINGS SET Amount=? WHERE Instrument = ? AND FK_USER_ID=?",[(Holdings["Cash"]["Amount"] - totalPrice).toFixed(2), "Cash", UserID]);
      await client.run("INSERT INTO Trades (FK_USER_ID, Instrument, Amount, Cost, Method) VALUES (?,?,?,?,?)", [UserID,Stock,Amount,price, method])
    }else {
      await client.run("UPDATE HOLDINGS SET Amount=? WHERE Instrument = ? AND FK_USER_ID=?",[(Holdings["Cash"]["Amount"] + totalPrice).toFixed(2), "Cash",UserID]);
      await client.run("INSERT INTO Trades (FK_USER_ID, Instrument, Amount, Cost, Method) VALUES (?,?,?,?,?)", [UserID,Stock,-Amount,price, method])
    }
    if (Holdings[Stock] == undefined){
      // If user doesn't currently own the stock
      await client.run("INSERT INTO HOLDINGS (FK_USER_ID, Instrument, Amount, Average_Price) VALUES (?,?,?,?)", [UserID,Stock,Amount,price])
    }else{
      // If user does currently own the stock
      var avgPrice = Holdings[Stock]["Average_Price"];
      var trades = await client.all("SELECT TRADE_ID,Amount,Cost,Method FROM Trades WHERE FK_USER_ID=? AND INSTRUMENT=? AND Cost is not 0.0 AND Amount is not 0.0;",[UserID, Stock]);
      var calcs = await OrderCalc(avgPrice, Amount,Stock,Holdings,method, trades);
      if (calcs[0] == 0){
        trades.forEach(async(trade) => {
          await client.run("UPDATE Trades SET Cost=0, Amount=0, Closed_Cost=?, Closed_Amount=? WHERE TRADE_ID=?", [trade.Cost, trade.Amount,trade.TRADE_ID]);
        })
      }
      await client.run("UPDATE HOLDINGS SET Amount=?, Average_Price=? WHERE Instrument = ? AND FK_USER_ID=?",[calcs[0], calcs[1],Stock,UserID]);
    }    
  }
  
  var holds = await GetHoldingsData(client, UserID);
  client.close();
  return [holds, CanOrder];
}
async function OrderCalc(avgPrice, Amount,Stock, Holdings, method, trades){
  if (method == "Buy"){
    Amount = Amount + Holdings[Stock]["Amount"]
  }
  else {
    Amount = Holdings[Stock]["Amount"] - Amount
  }
  var Average = await CalcAvgPrice(trades);
  return ([Amount, Average])
}

async function CalcAvgPrice(trades){
  var AmountSum = 0
  var TotalCostSum = 0
  trades.forEach(trade => {
    TotalCostSum += (trade.Cost * trade.Amount);
    AmountSum += trade.Amount
  });
  if (AmountSum == 0){
    return 0
  }
  var avg =(TotalCostSum/AmountSum).toFixed(2); 
  return avg;
}


  async function IsRegistered(client, data,){
    var row = await client.get("SELECT * FROM Users WHERE Name=?",data["Name"]);
    if (row == undefined){
      return AddUserToDatabase(client,data["Name"], data["Password"])
    }else {
      client.close();
      return RegisterReturnData(false);
    }
  }

  async function RegisterUser(data){
    var client = await ConnectDatabase();
    return await IsRegistered(client, data);
  }

  async function AddUserToDatabase(client,user, pass) {
    var hash = await bcrypt.hash(pass, 0, null);
    var insert = await client.run("INSERT INTO Users (Name, Password) VALUES (?,?)", [user,hash]);
    var userId = insert.lastID;
    return AddTokenToDatabase(client,user,hash,userId)
  }
  
  async function AddTokenToDatabase(client, user,hash, userid)
  {
    var Token = await bcrypt.hash(user + hash,10, null)
    await client.run("INSERT INTO Auth (FK_USER_ID, Token) VALUES (?,?)", [userid, Token]);  
    client.close();
    return RegisterReturnData(true, Token)
  }

  function RegisterReturnData(status, Token=null) {
    data = {
      Status : status,
      Auth : Token
    }
    return data;
    
  }  
  async function ConnectDatabase() {
    var client = await sql.open({
      filename: 'PLATFORM.db',
      driver: sqlite3.Database
    });
    return client
  }

  async function GetInitialData (Token) {
    var client = await ConnectDatabase();
    var authed = await IsValidAuth(Token, client, true)
    if (authed[0]){
      var holdings = await GetHoldingsData(client, authed[1]);
      client.close();
      return {authed : true, holdings : holdings}
    }
    else{
      return {authed : false};
    }
  }

  async function GetHoldingsData(client, userid) 
  {
     return await client.all("SELECT Instrument,Amount,Average_Price FROM Holdings WHERE FK_USER_ID=? AND Amount is not 0.0",userid);
  }


  
  module.exports = { CheckSession, RegisterUser, GetInitialData, OrderStock};