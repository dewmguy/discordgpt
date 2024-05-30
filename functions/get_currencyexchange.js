// get_currencyexchange.js

const fetch = require('node-fetch');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_currencyexchange = async ({ currencyFrom, currencyTo, amount }) => {
  console.log("get_currencyexchange function was called");
  console.log(`converting ${amount} from ${currencyFrom} to ${currencyTo}`);
  try {
    const url = `https://currency-conversion-and-exchange-rates.p.rapidapi.com/convert?from=${currencyFrom}&to=${currencyTo}&amount=${amount}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
    return result;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_currencyexchange };