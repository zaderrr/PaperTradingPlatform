const fetch = require("node-fetch")
import config from 'config.js'


const secret = config.APP_SECRET;
const pub = config.PUB_KEY;

const sBox = config.SBOX_KEY;
async function GetStockPrice(stock){
    //var url = "https://cloud.iexapis.com/v1/stock/" + stock + "/quote?token=" + pub;
    var url = "https://sandbox.iexapis.com/v1/stock/" + stock + "/quote?token=" + sBox;
    
    const response = await fetch(url);
    const body = await response.json()
    return body['iexRealtimePrice']
}
module.exports = { GetStockPrice};