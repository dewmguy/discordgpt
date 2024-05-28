// get_dictionary.js

const fetch = require('node-fetch');

const get_dictionary = async ({ word }) => {
  console.log("get_dictionary function was called");
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const response = await fetch(url);
    const data = await response.json();
    const result = data;
    if (!result) throw new Error('No data returned for the given word: ${word}');
    return result;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_dictionary };