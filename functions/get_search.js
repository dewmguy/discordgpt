// get_search.js

const fetch = require('node-fetch');
const SERPAPI_APIKEY = process.env.SERPAPI_APIKEY;

const get_search = async ({ query, searchType }) => {
  try {
    console.log("get_search function was called");
    console.log(`query: "${query}" searchType: "${searchType}"`);

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

    const response = await fetch(serpApiUrl);
    const data = await response.json();
    let results;

    if (searchType === 'news') { results = data.news_results; }
    else if (searchType === 'sports') { results = data.sports_results ? data.sports_results : data.organic_results; }
    else { results = data.organic_results; }
    
    console.log(`returning search results`);
    return results;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_search };

// not a function call