const express = require('express'); //Line 1
const app = express(); //Line 2
const port = process.env.PORT || 5000; //Line 3
const bodyParser = require('body-parser');;
const { json } = require('express/lib/response');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.raw());
const jwt = require('jsonwebtoken');
const DataBase = require("./DataBaseHelper.js");
const fs = require('fs');


// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6



app.post('/register', async (req, res) => {
  var data = req.body
  var usereg = await DataBase.RegisterUser(data)
  console.log(usereg)
  res.send(JSON.stringify(usereg))
});

app.post('/CheckSession', async (req, res) => {
  var data = req.headers['authorisation']
  var found = false;
  if (data != "null"){
    var ValidSession = await DataBase.CheckSession(data, res)
    if (ValidSession != undefined){
      res.send({Valid : true});
      return;
    }
  }
  res.send({Valid : false})

});


app.post('/buyStock', async (req, res) => {
  var data = req.cookies['SessionID']
  
});
