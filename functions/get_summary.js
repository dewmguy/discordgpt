// get_summary.js

const { get_article } = require('./get_article');

const get_summary = async ({ url }) => {
  console.log("get_summary function was called");
  console.log(`getting summary for ${url}`);

  try {
    const directive = 'You are a professional copy editor, please strip and summarize the contents of the article.';
    const summary = await get_article({ url, directive });
    return summary;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_summary };

/*
{
  "name": "get_summary",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The url"
      }
    },
    "required": [
      "url"
    ]
  },
  "description": "This function will attempt to scrape the URL provided to extract information that the user may otherwise not want to look at themselves."
}
*/