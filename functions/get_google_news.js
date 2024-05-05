// get_google_news.js

const fetch = require('node-fetch');
const SERPAPI_APIKEY = process.env.SERPAPI_APIKEY;

const get_google_news = async ({ query }) => {
  console.log("get_google_news function was called");
  try {
    const response = await fetch(`https://serpapi.com/search?engine=google_news&q=${encodeURIComponent(query)}&api_key=${SERPAPI_APIKEY}`, {method: 'GET'});
    const data = await response.json();
    console.log("Data fetched successfully:", data.news_results);
    return data.news_results;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_google_news };