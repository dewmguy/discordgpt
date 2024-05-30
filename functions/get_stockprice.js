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

/*
{
  "name": "get_stockprice",
  "description": "This function connects to the Stock Market API to retrieve data for a given ticker symbol. Retrieves: volume, volumeWeighted, open value, close value, high, low, and the number of transactions. Can be useful for determining yesterday's close value, or the market value of a company.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticker": {
        "type": "string",
        "description": "The ticker symbol of the stock."
      }
    },
    "required": [
      "ticker"
    ]
  }
}
*/

/**
 * This JavaScript code exports a single function called `get_stockprice`. This function is an asynchronous function that takes an object
 * as an argument with a property called `ticker`. When called, this function connects to the Stock Market API using the `node-fetch`
 * library to retrieve data for a given ticker symbol. The function constructs a URL using the ticker value and the API key stored in the
 * `STOCKMARKETAPI_APIKEY` environment variable. It then makes a GET request to the API and parses the JSON response. If the response contains
 * data, it returns an object containing the volume, volumeWeighted, open value, close value, high, low, timestamp, and number of transactions.
 * If the response does not contain data, it throws an error. If there is an error during the process, it logs the error and returns the error.
 *
 * @param {Object} options - An object with a single property, `ticker`, which is a string representing the ticker symbol of the stock.
 * @param {string} options.ticker - The ticker symbol of the stock.
 * @returns {Promise<Object>} An object containing the volume, volumeWeighted, open value, close value, high, low, timestamp, and number of transactions.
 * @throws {Error} If no data is found for the ticker symbol.
 */