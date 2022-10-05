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

// create a GET route
app.get('/express_backend', (req, res) => { //Line 9
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); //Line 10
}); //Line 11


app.post('/register', async (req, res) => {
  var data = req.body
  var usereg = await DataBase.RegisterUser(data, res)

});

app.post('/CheckSession', async (req, res) => {
  var data = req.headers['authorisation']
  var found = false;
  if (data != "null"){
    await DataBase.CheckSession(data, res)
  }
  else{
    res.send({Valid : false})
  }

});


app.post('/buyStock', async (req, res) => {
  var data = req.cookies['SessionID']
  
});


function RespondToAuth(req, res){
  res.send({Valid : found})
}
