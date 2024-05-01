const axios = require('axios');

const get_wikipedia_summary = async (args) => {
  console.log("get_wikipedia_summary was called");
  try {
    const { topic = "Earth", language = "en" } = args;
    const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const response = await axios.get(url);
    return response.data;
  }
  catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }
};

module.exports = { get_wikipedia_summary };