// function_fetch.js

const fetch = require('node-fetch');

const function_fetch = async (url, options) => {
  //console.log("[function_fetch] Function called");
  try {
    const response = await fetch(url, options);
    if(!response) { throw new Error('No response.'); }
    return await response.json();
  }
  catch (error) {
    console.error("[function_fetch] Error:", error);
    return { error: error.message };
  }
}

module.exports = { function_fetch };