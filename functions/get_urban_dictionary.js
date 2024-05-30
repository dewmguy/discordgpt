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

/*
{
  "name": "get_urban_dictionary",
  "description": "This function connects to the Urban Dictionary API. Useful for pulling meanings, origins, idioms, and colloquialisms for slang words and phrases.",
  "parameters": {
    "type": "object",
    "properties": {
      "word": {
        "type": "string",
        "description": "The word in question"
      }
    },
    "required": [
      "word"
    ]
  }
}
*/

/**
 * This function connects to the Urban Dictionary API and retrieves the list of definitions for a given word. It takes a word as a parameter and returns a promise that resolves to an array of strings containing the definitions. If there is an error during the API request, the function returns a promise that resolves to null.
 *
 * @param {Object} options - An object containing the word to query.
 * @param {string} options.word - The word to query the Urban Dictionary API for.
 * @return {Promise<Array<string>|null>} A promise that resolves to an array of strings containing the definitions for the word, or null if there was an error.
 */