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

//#region Callable functions from outside module
// Checks database for Auth Token
async function IsUserAuthed (Auth){
  var client = await ConnectDatabase();
  var found = await IsValidAuth(Auth, client);
  client.close();
  return found;
}

//Gets the return information for the initial message
async function GetInitialMessageReturnInfo (Auth) {
  var Client = await ConnectDatabase();
  var UserID = await GetUserID(Auth, Client);
  var Holdings = await GetHoldingsData(Client,UserID, "0.0");
  var Trades = await GetUserTrades(UserID, Client)
  return [Holdings,Trades]
}
//#endregion






// Find auths with matching tokens. Will return undefined if none exist.
async function IsValidAuth(Auth, client)
{
  var authFound = await GetUserID(Auth,client)
  if (authFound == undefined){
    return false;
  }else{
    return true;
  }
}
async function GetUserTrades(UserID, Client) {
  var trades = await Client.all("SELECT Instrument,Amount,Cost,Method,Status FROM Trades WHERE FK_USER_ID=?",[UserID]);
  return trades
}



async function GetUserID(Auth, client){
  var details = await client.get("SELECT FK_USER_ID FROM Auth WHERE Token=?", Auth);
  return details.FK_USER_ID
}
function UserCanOrderStock(method,totalPrice,Amount,Stock,Holdings) {
  if (method == "Buy" && Holdings["Cash"]["Amount"] >= totalPrice){
    return true
  }
  if (Holdings[Stock] != undefined && Holdings[Stock]["Amount"] >= Amount && Amount >=1 && method=="Sell"){
    return true
  }
  
  return false
}
const OrderStock = async function (Amount,Stock,price, method, Auth) { 
  var client = await ConnectDatabase();
  var UserID = await GetUserID(Auth, client)
  var stockHoldings = await GetHoldingsData(client, UserID, "")
  var Holdings = {}
  stockHoldings.forEach(holding => {
    Holdings[holding["Instrument"]] = holding;
  });
  var totalPrice = price * Amount;
  var CanOrder = UserCanOrderStock(method,totalPrice,Amount,Stock,Holdings)
  if (CanOrder){
    if (method == "Buy"){
      await UpdateCashAmountAndInsertTrade(client,Holdings["Cash"]["Amount"] - totalPrice,UserID,Amount,price,method, Stock);
      
    }else {
      await UpdateCashAmountAndInsertTrade(client,Holdings["Cash"]["Amount"] + totalPrice,UserID,-Amount,price,method, Stock);
    }
    
    if (Holdings[Stock] == undefined){
      await client.run("INSERT INTO HOLDINGS (FK_USER_ID, Instrument, Amount, Average_Price) VALUES (?,?,?,?)", [UserID,Stock,Amount,price])
    }else{
      var avgPrice = Holdings[Stock]["Average_Price"];
      var trades = await client.all("SELECT TRADE_ID,Amount,Cost,Method FROM Trades WHERE FK_USER_ID=? AND INSTRUMENT=? AND Status=?",[UserID, Stock,"Active"]);
      var calcs = await OrderCalc(avgPrice, Amount,Stock,Holdings,method, trades);
      if (calcs[0] == 0){
        await NullOldTrades(trades, client)
      }
      await client.run("UPDATE HOLDINGS SET Amount=?, Average_Price=? WHERE Instrument = ? AND FK_USER_ID=?",[calcs[0], calcs[1],Stock,UserID]); 
    }
  }
  var holds = await GetHoldingsData(client, UserID, "0.0");
  client.close();
  return [holds, CanOrder];
};

async function NullOldTrades(trades, client){
  trades.forEach(async(trade) => {
    await client.run("UPDATE Trades SET Status=? WHERE TRADE_ID=?", ["Closed",trade.TRADE_ID]);
  })
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



async function RegisterUser(data){
  var client = await ConnectDatabase();
  var UserID = await client.get("SELECT * FROM USERS WHERE Name=?", [data["Name"]]);
  if (UserID == undefined){
    return AddUserToDatabase(client,data["Name"], data["Password"])
  }else {
    client.close();
    return RegisterReturnData(false);
  }
}

async function AddUserToDatabase(client,user, pass) {
  var hash = await CreateHash(pass);
  var insert = await client.run("INSERT INTO Users (Name, Password) VALUES (?,?)", [user,hash]);
  var userId = insert.lastID;
  return AddTokenToDatabase(client,user,hash,userId)
}
async function CreateHash(input){
  var hash = await bcrypt.hash(input, 0, null);
  return hash;
}
async function AddTokenToDatabase(client, user,hash, userid)
{
  var Token = await CreateHash(user + hash);
  await client.run("INSERT INTO Auth (FK_USER_ID, Token) VALUES (?,?)", [userid, Token]);  
  await client.run("INSERT INTO Holdings (FK_USER_ID, Instrument, Amount) VALUES (?,?,?)", [userid,"Cash", 50000]);  
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


async function GetHoldingsData(client, userid,filter) 
{
  var holdings =  await client.all("SELECT Instrument,Amount,Average_Price FROM Holdings WHERE FK_USER_ID=? AND Amount is not ?",[userid, filter]);
  return holdings
}

async function UpdateCashAmountAndInsertTrade(client,NewCashAmount, UserID,Amount,price,method,Stock){
  await client.run("UPDATE HOLDINGS SET Amount=? WHERE Instrument = ? AND FK_USER_ID=?",[NewCashAmount.toFixed(2), "Cash", UserID]);
  await client.run("INSERT INTO Trades (FK_USER_ID, Instrument, Amount, Cost, Method,Status) VALUES (?,?,?,?,?,?)", [UserID,Stock,Amount,price, method,"Active"])
}




module.exports = { IsUserAuthed, RegisterUser, GetInitialMessageReturnInfo, OrderStock};