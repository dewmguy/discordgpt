// get_inflation.js

const fetch = require('node-fetch');

const get_inflation = async ({ country, dateStart, dateEnd, amount }) => {
  console.log("get_inflation function was called");
  console.log(`Getting inflation value for ${amount} from ${dateStart} to ${dateEnd} in ${country}`);
  
  const url = new URL('https://www.statbureau.org/calculate-inflation-price-jsonp');
  const params = {
    jsoncallback: '?',
    country: country,
    start: dateStart,
    end: dateEnd,
    amount: amount,
    format: true
  };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonpData = text.match(/^\?\((.*)\)$/)[1];
    const result = JSON.parse(jsonpData);
    console.log(result);
    return result;
  }
  catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { get_inflation };

/*
{
  "name": "get_inflation",
  "description": "Connect to Inflation API to retrieve information about the differences in inflationary values of currency between two separate times for the currency of a specific region.",
  "parameters": {
    "type": "object",
    "properties": {
      "country": {
        "type": "string",
        "description": "The country for the currency in question.",
        "enum": ["belarus","brazil","canada","european-union","eurozone","france","germany","greece","india","japan","kazakhstan","mexico","russia","spain","turkey","ukraine","united-kingdom","united-states"],
        "default": "united-states"
      },
      "dateStart": {
        "type": "string",
        "description": "The first (oldest) date in the range of time to calculate inflation. Format: YYYY/MM/DD",
        "format": "date"
      },
      "dateEnd": {
        "type": "string",
        "description": "The last (most recent) date in the range of time to calculate inflation. Format: YYYY/MM/DD. Default to today's date.",
        "format": "date"
      },
      "amount": {
        "type": "number",
        "description": "The amount of currency to calculate. Does not require the currency symbol."
      }
    },
    "required": ["country","dateStart","dateEnd","amount"]
  }
}
*/

/**
 * This module exports a single function called get_inflation, which is used to retrieve information about the differences in inflationary values of currency between two separate times for the currency of a specific region. The function takes an object with three properties: country, dateStart, and dateEnd. The function makes a GET request to the Inflation API to retrieve the requested data. It then calculates and returns the converted amount as a number.
 *
 * @module get_inflation
 * @param {Object} params - An object containing the following properties:
 * @param {string} params.country - The country for the currency in question. Defaults to "united-states".
 * @param {string} params.dateStart - The first (oldest) date in the range of time to calculate inflation. Format: YYYY/MM/DD.
 * @param {string} params.dateEnd - The last (most recent) date in the range of time to calculate inflation. Format: YYYY/MM/DD. Defaults to today's date.
 * @param {number} params.amount - The amount of currency to calculate. Does not require the currency symbol.
 * @return {Promise<number>} A promise that resolves to the converted amount as a number.
 */