const { MongoClient } = require('mongodb');
const bcrypt = require("bcryptjs");
const sqlite3 = require('sqlite3').verbose();
const { json } = require('express/lib/response');


async function CreateDB()
{
  const db = new sqlite3.Database('PLATFORM.db');
  db.serialize(() => {
    db.run("CREATE TABLE Users (USER_ID INTEGER PRIMARY KEY AUTOINCREMENT,Name TEXT, Password TEXT) ");  
    db.run("CREATE TABLE Auth (FK_USER_ID INTEGER NOT NULL, Token varchar(255))"); 
    db.run("CREATE TABLE Trades (TRADE_ID INTEGER PRIMARY KEY AUTOINCREMENT, FK_USER_ID INTEGER NOT NULL, Instrument varchar(255)) NOT NULL, Amount REAL NOT NULL, Cost REAL NOT NULL"); 
  });
db.close();
}


async function BuyStock() {       
    const dbName = "UserAccounts"
    const client = await ConnectDatabase(dbName);
  
  }

// Checks database for Auth Token
async function CheckSession (SessionID, res){
    var client = await ConnectDatabase();
    var found = await IsValidAuth(SessionID, client,res);
}
  
async function IsValidAuth(SessionID, client, res)
{
  await client.get("SELECT * FROM Auth WHERE Token=?", SessionID, (err,row) => {
    if (row.FK_USER_ID == undefined){
      client.close();
      res.send({Valid : false});
    }else {
      client.close();
      res.send({Valid : true});
    }
  });
}


  async function IsRegistered(client, data,res){
    await client.get("SELECT * FROM Users WHERE Name=?",data["Name"], (err,row) => {
      if (row == undefined){
        AddUserToDatabase(client,data["Name"], data["Password"],res)
      }else {
        client.close();
        RespondToRegister(res,true);
      }
    });
  }


  async function RegisterUser(data,res){
    var client = await ConnectDatabase();
    IsRegistered(client, data,res);
  }

  async function AddUserToDatabase(client,user, pass,res) {
    var hash = await bcrypt.hash(pass, 0, null);
    var userId = 0
    client.run("INSERT INTO Users (Name, Password) VALUES (?,?)", [user,hash], (err,row) => {
      client.get("SELECT * FROM Users WHERE Name=?",user, (err,row) => {
        userId = row.USER_ID;
        AddTokenToDatabase(client,user,hash,userId,res)
      });
    }); 
  }
  
  async function AddTokenToDatabase(client, user,hash, userid,res)
  {
    var Token = await bcrypt.hash(user + hash,10, null)
    await client.run("INSERT INTO Auth (FK_USER_ID, Token) VALUES (?,?)", [userid, Token]);  
    client.close();
    RespondToRegister(res,true, Token)
  }

  function RespondToRegister(res, status, Token=null) {
    res.send({
      Status : status,
      Auth : Token
    })
  }

  async function AddFunds(accName){
    const dbName = "UserAccounts";
    var client = await ConnectDatabase(dbName);
    var db = client.db(dbName);
    await db.collection('TradingAccount').insertOne({'Name' : accName, 'CashFunds' : 1000000})
    await client.close();
  }
  
  
  async function ConnectDatabase() {
    var client = new sqlite3.Database('PLATFORM.db')
    return client
  
  }

  async function GetInitialData (AccountSession) {
    const dbName = "Users"
    var client = await ConnectDatabase(dbName);
    var db = client.db(dbName);
    var accName = "";
    var filteredDocs = await db.collection('Sessions').find({ Session : AccountSession }).toArray();
    if (filteredDocs.length == 1 ) {
        accName = filteredDocs[0]['Name']
    }
    else{
        
    }
    await client.close();
    client = await ConnectDatabase("UserAccounts");
    db = client.db("UserAccounts");
    filteredDocs = await db.collection('TradingAccount').find({ Name : accName }).toArray();
    await client.close();
    return filteredDocs[0]['CashFunds']

  }
  
  module.exports = { CheckSession, RegisterUser, GetInitialData};