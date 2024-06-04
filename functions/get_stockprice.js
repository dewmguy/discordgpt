// get_stockprice.js

const fetch = require('node-fetch');
const STOCKPRICEAPIKEY = process.env.STOCKMARKETAPI_APIKEY;

const get_stockprice = async ({ ticker }) => {
  console.log("get_stockprice function was called");
  console.log(`Fetching stock price for ${ticker}`);
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${STOCKPRICEAPIKEY}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.status === "OK") {
      const data = result.results[0];
      const stockData = {
        ticker: result.ticker,
        volume: data.v,
        volumeWeighted: data.vw,
        open: data.o,
        close: data.c,
        high: data.h,
        low: data.l,
        timestamp: data.t,
        transactions: data.n
      };
      console.log(stockData);
      return stockData;
    }
    else { throw new Error(`No data found for ticker ${ticker}`); }
  }
  catch (error) {
    console.error("Error in get_stockprice:", error);
    return { error: error.message };
  }
};

module.exports = { get_stockprice };

/*
{
  "name": "get_stockprice",
  "description": "Retrieves the previous trading day close values of stock data from the Stock Market API. Useful when asked about a stock.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticker": {
        "type": "string",
        "description": "The stock ticker symbol."
      }
    },
    "required": [
      "ticker"
    ]
  }
}
*/