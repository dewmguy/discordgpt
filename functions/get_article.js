// get_article.js

const { get_gptresponse } = require('./get_gptresponse');
const fetch = require('node-fetch');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_article = async ({ url, directive }) => {
  console.log("get_article function was called");
  console.log(`pulling data from article ${url}`);
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
    markdown = await turndownService.turndown(data);
    const summary = await get_gptresponse(directive,markdown);
    return summary;
  }
  catch (error) {
    console.error("Error in get_article:", error);
    return { error: error.message };
  }
}

module.exports = { get_article };

// not a function call