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