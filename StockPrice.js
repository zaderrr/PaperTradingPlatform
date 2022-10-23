const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = 'config.js'

async function GetChartData(stock){
    // TODO ADD CUSTOM TIME PERIOD
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + stock + "?metrics=high?&interval=1mo&range=1y ",{ 
        method :"GET"
    });
    var body = await response.json()
    return body
}

async function GetPriceData(stock) {
    const response = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + stock,{ 
        method :"GET"
    });
    var body = await response.json()
    return body
}
module.exports = { GetChartData, GetPriceData };