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

/*
{
  "name": "get_dictionary",
  "description": "This function connects to the Free Dictionary API. Useful for pulling meanings, origins, synonyms, and anonyms of words. When asked to define a word or when otherwise necessary, ensure to call the function for urban dictionary too.",
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
 * This function connects to the Free Dictionary API. It takes a word as a parameter and returns the corresponding dictionary entry. The function returns a promise that resolves to an object with the following properties:
 * - `word`: the word that was queried
 * - `phonetics`: an array of objects containing the phonetic transcription of the word
 * - `origin`: an array of objects containing the origin of the word
 * - `meanings`: an array of objects containing the meanings of the word, each with a `partOfSpeech` and `definitions` property
 * If there is an error during the API request, the function returns a promise that resolves to an object with an `error` property containing the error message.
 */