// get_astronomy_search.js

const axios = require('axios');
const ASTRONOMY_HASH = process.env.ASTRONOMY_HASH;
const { get_gptresponse } = require('./get_gptresponse');

const get_astronomy_search = async (query, searchType, limit) => {
  console.log("get_astronomy_search function was called");
  console.log(`searching ${searchType} for ${query} with a limit of ${limit}`);
  
  const directive = `You're an astronomy expert. The search feature requires a star name, but sometimes users will be searching for a constellation when they mean to be searching for a star. Your job is to identify whether or not the name given is a constellation, and then output the name of the most relevant star in the constellation. All you have to do is output the name of the most relevant star. If the name is a star or both (such as orion), you don't have to change anything. Your output will not be read by a human, it will be used in functions. Thank you.`;
  const starName = await get_gptresponse(directive,query);
  console.log(`corrected search for ${query} to ${starName}`);

  try {
    let url = `https://api.astronomyapi.com/api/v2/search?term=${starName}&match_type=fuzzy&limit=${limit}`;
    let config = {
      method: 'get',
      url: url,
      headers: {'Authorization': `Basic ${ASTRONOMY_HASH}`}
    };

    const response = await axios.request(config);
    console.log(response.data.data[0]);

    if (response.data.length === 0) { throw new Error('No results found'); }

    if (searchType === 'general') { return response.data.data[0]; }
    if (searchType === 'constellation') { return response.data.data[0].position.constellation.id; }
    else { return false; }
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_astronomy_search };