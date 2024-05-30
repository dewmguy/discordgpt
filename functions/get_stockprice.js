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
    console.error(error);
    return error;
  }
};

module.exports = { get_stockprice };