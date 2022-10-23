const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = 'config.js'

async function GetChartData(stock){
    // TODO ADD CUSTOM TIME PERIOD
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + stock + "?metrics=high?&interval=1mo&range=1y ",{ 
        method :"GET"
    });
    var body = await response.json()
    return BuildStockHistoryMsg(body)
    return 
}

async function GetPriceData(stock) {
    const response = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + stock,{ 
        method :"GET"
    });
    var body = await response.json()
    return body

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





module.exports = { GetChartData, GetPriceData };