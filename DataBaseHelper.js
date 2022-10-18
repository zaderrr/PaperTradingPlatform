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
async function CheckSession (SessionID){
    var client = await ConnectDatabase();
    var found = await IsValidAuth(SessionID, client);
    client.close();
    return found;
}
  
// Find auths with matching tokens. Will return undefined if none exist.
async function IsValidAuth(SessionID, client, NeedUserId=null)
{
  var authFound = await client.get("SELECT * FROM Auth WHERE Token=?", SessionID);
  if (authFound == undefined){
    if (NeedUserId != null){
      return ([false,authFound.FK_USER_ID])
    }
    return false
  }else{
    if (NeedUserId != null){
      return ([true,authFound.FK_USER_ID])
    }
    return true
  }
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

  async function AddFunds(accName){
    const dbName = "UserAccounts";
    var client = await ConnectDatabase(dbName);
    var db = client.db(dbName);
    await db.collection('TradingAccount').insertOne({'Name' : accName, 'CashFunds' : 1000000})
    await client.close();
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
     return await client.all("SELECT Instrument,Amount,Average_Price FROM Holdings WHERE FK_USER_ID=?",userid);
  }
  
  module.exports = { CheckSession, RegisterUser, GetInitialData};