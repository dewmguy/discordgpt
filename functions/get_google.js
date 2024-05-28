// get_google.js

const fetch = require('node-fetch');
const { get_article } = require('./get_article');
const { get_gptresponse } = require('./get_gptresponse');
const SERPAPI_APIKEY = process.env.SERPAPI_APIKEY;

const get_google = async ({ query, searchType }) => {
  try {
    console.log("get_google function was called");

    let serpApiUrl;
    switch (searchType) {
      case 'news':
        serpApiUrl = `https://serpapi.com/search?engine=google_news&q=${encodeURIComponent(query)}&api_key=${SERPAPI_APIKEY}`;
        break;
      case 'sports':
      case 'web':
      default:
        serpApiUrl = `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${SERPAPI_APIKEY}`;
        break;
    }

    const response = await fetch(serpApiUrl, { method: 'GET' });
    const data = await response.json();
    let results;

    if (searchType === 'news') { results = data.news_results; }
    else if (searchType === 'sports') { results = data.sports_results ? data.sports_results : data.organic_results; }
    else { results = data.organic_results; }

    //console.log(results);

    if (searchType !== 'sports') {
      let summarized_results = [];
      let limit = 1;
      let count = 1;
      for (let result of results) {
        console.log('--------------------------------------------------');
        if(limit > 5) { break; }
        console.log(`checking result: ${count}, item: ${limit}`);
        const title = result.title;
        const url = result.link;
        console.log(`article title: "${title}"`);
        console.log(`article url: "${url}"`);
        console.log(`original query: "${query}"`);
        if (url) {
          const directive = `Your objective is to determine whether a web page appears to be relevant to a query. If it is, say "true". If it is not, say "false". Your output will not be read by a human, simply return the boolean output: true or false. Thanks.`;
          const prompt = `Is the page title "${title}" relevant to the search query "${query}"? True or false.`;
          let isRelevant = await get_gptresponse(directive, prompt);
          isRelevant = isRelevant.trim().toLowerCase();
          if (isRelevant === 'true') {
            console.log(`scraping article`);
            const articleSummary = await get_article({ url });
            if (!articleSummary.error) {
              summarized_results.push({
                articleTitle: title,
                articleLink: url,
                summary: articleSummary
              });
              limit++;
            }
            else { console.log(`error during article fetch, skipping`); }
          }
          else { console.log('article not relevant, skipping (${isRelevant})'); }
        }
        else { console.log('no link in this result, skipping'); }
        count++;
      }
      return summarized_results;
    }
    return results;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_google };

/*
{
  "name": "get_google",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The Google search query, optimized to target the best results for the inquiry in question."
      },
      "searchType": {
        "type": "string",
        "description": "The type of search to perform. Can be 'web', 'news', or 'sports'.",
        "enum": [
          "web",
          "news",
          "sports"
        ]
      }
    },
    "required": [
      "query",
      "searchType"
    ]
  },
  "description": "This function connects to the Google Search API to retrieve search results from Google. It can perform web searches, news searches, and sports searches based on the searchType parameter."
}
*/