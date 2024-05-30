const axios = require('axios');

const get_wikipedia_summary = async ({ topic, language }) => {
  console.log("get_wikipedia_summary was called");
  try {
    const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const response = await axios.get(url);
    return response.data;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
};

module.exports = { get_wikipedia_summary };

/*
{
  "name": "get_wikipedia_summary",
  "description": "This function connects to the Wikipedia API to fetch summarized articles. Useful for looking up information about specific topics, statistics, or trivia. Potentially more factual than Google search results.",
  "parameters": {
    "type": "object",
    "properties": {
      "topic": {
        "type": "string",
        "description": "The topic of the Wikipedia article to retrieve the summary for"
      },
      "language": {
        "type": "string",
        "description": "The language version of Wikipedia to query (e.g., 'en' for English)"
      }
    },
    "required": []
  }
}
*/

/**
 * This function connects to the Wikipedia API to fetch summarized articles. It takes in a topic and an optional language parameter, and returns a summary of the article in the specified language. If no language is provided, English is used by default. If the API call is successful, the function returns the summary data. If there is an error, the function returns an object with an 'error' property containing the error message.
 *
 * @param {object} params - An object containing the following properties:
 * @param {string} params.topic - The topic of the Wikipedia article to retrieve the summary for
 * @param {string} [params.language='en'] - The language version of Wikipedia to query (e.g., 'en' for English)
 * @return {Promise<object>} A Promise that resolves to the summary data of the Wikipedia article, or an object with an 'error' property if there is an error.
 */