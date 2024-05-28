// get_urban_dictionary.js

const fetch = require('node-fetch');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_urban_dictionary = async ({ word }) => {
  console.log("get_urban_dictionary function was called");
  try {
    const url = `https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${word}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'mashape-community-urban-dictionary.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.json();
    const definitions = result.list.map(entry => entry.definition);
    console.log(definitions);
    return definitions;
  }
  catch (error) { console.error(error); }
}

module.exports = { get_urban_dictionary };