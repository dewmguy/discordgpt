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

/*
{
  "name": "get_currencyexchange",
  "description": "Converts an amount from one currency to another using the RapidAPI currency conversion service.",
  "parameters": {
    "type": "object",
    "properties": {
      "currencyFrom": {
        "type": "string",
        "description": "The symbol for the currency from which to convert",
        "default": "USD",
        "enum": ["ANG","SVC","CAD","XCD","MVR","HRK","AUD","MWK","XAG","MAD","PHP","NAD","GNF","KES","MZN","BTN","MGA","AZN","XAU","RON","CHF","EGP","BSD","TWD","GGP","LVL","MMK","WST","ILS","BHD","GBP","TZS","SDG","LAK","DJF","BYN","LBP","RWF","PEN","EUR","ZMK","RSD","INR","MUR","BWP","GEL","KMF","UZS","RUB","CUC","BGN","JOD","NGN","BDT","PKR","BRL","KZT","CVE","HNL","NZD","ERN","NPR","ZMW","FKP","DZD","JMD","CRC","GMD","PLN","AMD","BMD","BZD","BBD","SBD","IDR","ALL","IQD","BIF","HKD","GIP","BAM","LKR","QAR","SAR","TOP","SEK","ZAR","ARS","MYR","BYR","KPW","CZK","STD","BTC","ZWL","LSL","COP","PAB","IRR","CNH","NOK","XPF","XOF","XDR","OMR","CNY","NIO","AOA","SCR","MOP","ISK","VND","VES","USD","UYU","VEF","MRU","UGX","DOP","UAH","BOB","TTD","KGS","TND","SGD","TMT","GHS","TJS","KHR","ETB","PGK","THB","AED","GTQ","LRD","SYP","KYD","SRD","HTG","LYD","SLL","SLE","SHP","IMP","FJD","PYG","KRW","SZL","GYD","MDL","MXN","CLP","LTL","SOS","MNT","AFN","CUP","CLF","JPY","TRY","YER","HUF","BND","JEP","MKD","AWG","CDF","VUV","XAF","KWD","DKK"]
      },
      "currencyTo": {
        "type": "string",
        "description": "The symbol for the currency to which to convert.",
        "enum": ["ANG","SVC","CAD","XCD","MVR","HRK","AUD","MWK","XAG","MAD","PHP","NAD","GNF","KES","MZN","BTN","MGA","AZN","XAU","RON","CHF","EGP","BSD","TWD","GGP","LVL","MMK","WST","ILS","BHD","GBP","TZS","SDG","LAK","DJF","BYN","LBP","RWF","PEN","EUR","ZMK","RSD","INR","MUR","BWP","GEL","KMF","UZS","RUB","CUC","BGN","JOD","NGN","BDT","PKR","BRL","KZT","CVE","HNL","NZD","ERN","NPR","ZMW","FKP","DZD","JMD","CRC","GMD","PLN","AMD","BMD","BZD","BBD","SBD","IDR","ALL","IQD","BIF","HKD","GIP","BAM","LKR","QAR","SAR","TOP","SEK","ZAR","ARS","MYR","BYR","KPW","CZK","STD","BTC","ZWL","LSL","COP","PAB","IRR","CNH","NOK","XPF","XOF","XDR","OMR","CNY","NIO","AOA","SCR","MOP","ISK","VND","VES","USD","UYU","VEF","MRU","UGX","DOP","UAH","BOB","TTD","KGS","TND","SGD","TMT","GHS","TJS","KHR","ETB","PGK","THB","AED","GTQ","LRD","SYP","KYD","SRD","HTG","LYD","SLL","SLE","SHP","IMP","FJD","PYG","KRW","SZL","GYD","MDL","MXN","CLP","LTL","SOS","MNT","AFN","CUP","CLF","JPY","TRY","YER","HUF","BND","JEP","MKD","AWG","CDF","VUV","XAF","KWD","DKK"]
      },
      "amount": {
        "type": "number",
        "description": "The amount of currency to convert."
      }
    },
    "required": [
      "currencyFrom",
      "currencyTo",
      "amount"
    ]
  }
}
*/

/**
 * This function takes three parameters: currencyFrom, currencyTo, and amount. It makes a GET request to the Fixer API to get the current exchange rate between the two currencies. It then calculates and returns the converted amount.
 *
 * @param {string} currencyFrom - The currency symbol for the currency to convert from.
 * @param {string} currencyTo - The currency symbol for the currency to convert to.
 * @param {number} amount - The amount of currency to convert.
 * @return {Promise<number>} A promise that resolves to the converted amount as a number.
 */