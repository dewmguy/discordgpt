// get_google_news.js

// serpapi
const fetch = require('node-fetch');
const SERPAPI_APIKEY = process.env.SERPAPI_APIKEY;

// openai
const { get_gptresponse } = require('./get_gptresponse');

const get_google_news = async ({ query }) => {
  try {
    console.log("get_google_news function was called");
    const serpApiUrl = `https://serpapi.com/search?engine=google_news&q=${encodeURIComponent(query)}&api_key=${SERPAPI_APIKEY}`;
    const response = await fetch(serpApiUrl, {method: 'GET'});
    const data = await response.json();

    return data.news_results;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_google_news };