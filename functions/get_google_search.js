// get_google_search.js

const fetch = require('node-fetch');
const SERPAPI_APIKEY = process.env.SERPAPI_APIKEY;

const get_google_search = async ({ query }) => {
  console.log("get_google_search function was called");
  try {
    const response = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${SERPAPI_APIKEY}`, {method: 'GET'});
    const data = await response.json();
    console.log("Data fetched successfully:", data.organic_results);
    return data.organic_results;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_google_search };