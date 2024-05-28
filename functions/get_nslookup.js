// get_nslookup.js

const fetch = require('node-fetch');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_nslookup = async ({ domain, record }) => {
  console.log("get_nslookup function was called");
  try {
    const url = `https://dns-lookup5.p.rapidapi.com/simple?domain=${domain}&recordType=${record}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'dns-lookup5.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
    return result;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_nslookup };