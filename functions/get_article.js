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