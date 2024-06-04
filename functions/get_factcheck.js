// get_factcheck.js

const fetch = require('node-fetch');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_factcheck = async ({ domain, record }) => {
  console.log("get_factcheck function was called");
  try {
    const url = `https://fact-checker.p.rapidapi.com/search?query=${encodeURIComponent(query)}&limit=5`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'fact-checker.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    if(!result) { return `There are no results to confirm nor deny the statement that ${query}`; }
    console.log(result);
    return result;
  }
  catch (error) {
    console.error("Error in get_factcheck:", error);
    return { error: error.message };
  }
}

module.exports = { get_factcheck };

/*
{
  "name": "get_factcheck",
  "description": "Retrieves information to confirm or deny the factuality of statements. Useful if asked about the validity of a statement or if a user says something questionable that you want to validate before you respond.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The statement."
      }
    },
    "required": [
      "query"
    ]
  }
}
*/