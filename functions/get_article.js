// get_article.js

const fetch = require('node-fetch');
const { get_gptresponse } = require('./get_gptresponse');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_article = async ({ url }) => {
  console.log("get_article function was called");
  try {
    
    const link = `https://article-extractor2.p.rapidapi.com/article/parse?url=${encodeURIComponent(url)}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'article-extractor2.p.rapidapi.com'
      }
    };
    const response = await fetch(link, options);
    const data = await response.text();
    const directive = 'You are a professional copy editor, strip and summarize the contents of the article data provided leaving the most important and relevant content. This content will not be read by a human, the output will return to an assitant api for further analysis.';
    const summary = await get_gptresponse(directive,data);
    return summary;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
}

module.exports = { get_article };

// not a function call

/**
 * This function is an async function that takes an object with a `url` property.
 * It uses the RapidAPI service to extract the article from the provided URL and then
 * uses get_gptresponse to summarize the article.
 * 
 * @async
 * @param {object} options - An object with a `url` property.
 * @param {string} options.url - The URL of the article to be extracted and summarized.
 * @returns {Promise<string|object>} - A Promise that resolves to the summarized article as a string or an error object.
 */