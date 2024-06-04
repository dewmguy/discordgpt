// get_google.js

const { get_search } = require('./get_search');
const { get_article } = require('./get_article');
const { get_gptresponse } = require('./get_gptresponse');

const get_google = async ({ query, searchType }) => {
  try {
    console.log("get_google function was called");

    const results = await get_search({ query, searchType });

    if (searchType == 'sports') { return results; }
    else {
      let summarized_results = [];
      let limit = 1;
      let count = 1;
      for (let result of results) {
        console.log('--------------------------------------------------');
        if (limit > 5) { break; }
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
          console.log(`is article relevant: ${isRelevant}`);
          if (isRelevant === 'true') {
            console.log(`scraping article`);
            const directive = 'You are a professional copy editor, strip and summarize the contents of the data provided leaving the most important and relevant content. This content will not be read by a human, the output will return to an assitant api for further analysis.';
            const articleSummary = await get_article({ url, directive });
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
          else { console.log(`article not relevant, skipping (${isRelevant})`); }
        }
        else { console.log('no link in this result, skipping'); }
        count++;
      }
      return summarized_results;
    }
  }
  catch (error) {
    console.error("Error in get_google:", error);
    return { error: error.message };
  }
}

module.exports = { get_google };

/*
{
  "name": "get_google",
  "description": "Retrieve web search results, local news, world news, or sports articles from Google. Useful when asked about anything that may require current or in-depth information.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query. Optimize to target the best results."
      },
      "searchType": {
        "type": "string",
        "description": "The search category.",
        "enum": [
          "web",
          "news",
          "sports",
          "local_news"
        ]
      }
    },
    "required": [
      "query",
      "searchType"
    ]
  }
}
*/