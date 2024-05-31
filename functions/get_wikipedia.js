const fetch = require('node-fetch');

const get_wikipedia = async ({ query }) => {
  console.log("get_wikipedia was called");
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const result = await response.json();
    if(result) {
      return result.extract;
    }
    else {
      throw new Error("There is something wrong with the response from Wikipedia.");
    }
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
};

module.exports = { get_wikipedia };

/*
{
  "name": "get_wikipedia",
  "description": "This function connects to the Wikipedia API to fetch summarized articles. Useful for looking up information about specific topics, statistics, or trivia.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The topic of the Wikipedia article to retrieve the summary for"
      }
    },
    "required": ["query"]
  }
}
*/

/**
 * This function connects to the Wikipedia API to fetch summarized articles. It takes in a topic and an optional language parameter, and returns a summary of the article in the specified language. If no language is provided, English is used by default. If the API call is successful, the function returns the summary data. If there is an error, the function returns an object with an 'error' property containing the error message.
 *
 * @param {object} params - An object containing the following properties:
 * @param {string} params.query - The topic of the Wikipedia article to retrieve the summary for
 * @return {Promise<object>} A Promise that resolves to the summary data of the Wikipedia article, or an object with an 'error' property if there is an error.
 */