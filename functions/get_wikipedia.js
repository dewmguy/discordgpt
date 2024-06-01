// get_wikipedia.js

const { get_search } = require('./get_search');
const { get_article } = require('./get_article');
const fetch = require('node-fetch');

const get_wikipedia = async ({ query }) => {
  console.log("get_wikipedia was called");
  console.log(`query: "${query}"`);

  try {
    query = `wikipedia ${query}`;
    const searchType = 'web';
    const searchResults = await get_search({ query, searchType });

    let url;
    for (let result of searchResults) {
      console.log(result.link);
      if (result.link.includes('wikipedia.org')) {  // search the results and pull the first wikipedia result
        url = result.link;
        console.log('article found');
        break;
      }
    }
    if (!url) { throw new Error(`No relevant Wikipedia article found for query "${query}"`); }
    
    const directive = `You are a professional copy editor, strip and summarize the contents of the article provided leaving the most important and relevant content related to the query "${query}."`;
    const scrape = await get_article({ url, directive });

    // Fetch the summary from Wikipedia's API
    const title = url.split('/').pop();
    console.log(title);
    const summaryURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(summaryURL);
    const result = await response.json();

    if (result || scrape) {
      return {
        link: url,
        excerpt: result.extract,
        summary: scrape
      };
    }
    else { throw new Error("There is something wrong with the response from Wikipedia."); }
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
};

module.exports = { get_wikipedia };


/* get_wikipedia.js

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