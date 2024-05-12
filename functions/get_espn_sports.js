// get_espn_sports.js

const fetch = require('node-fetch');

// openai
const { get_gptresponse } = require('./get_gptresponse');

const get_espn_sports = async ({ sport, league, infoType, team, location }) => {
  try {
    console.log(`get_espn_sports function was called`);

    if(!location && sport && league && infoType == 'team') {
      const searchQuery = `need location data for ${sport} ${league} ${team}`;
      console.log(searchQuery);
      const directive = `You are a sports expert. You know where every sports team is located in either the city (for pro sports) or the state (for college sports). Your job is to analyze the data provided to determine the most accurate result of either the city name or the state name. inquiries will either be for professional or college sports teams. if the team is a professional team, only the city name is required. If the team is a college team, only the state name is required. Your response will be fed directly into functions and will not be read by a human. Ensure that your response is concise and accurate so as not to break functions that require the exact answer. answers need only be one-word responses with no spaces (e.g. 'denver' or 'wisconsin').`;
      const gptquery = JSON.stringify(searchQuery);
      location = await get_gptresponse(directive,gptquery);
      console.log(`location for ${sport} ${league} is "${location}"`);
    }

    let basePath = `http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}`;
    let url;

    switch (infoType) {
      case 'news':
        url = `${basePath}/news`;
        break;
      case 'scores':
        url = `${basePath}/scoreboard`;
        break;
      case 'team':
        url = `${basePath}/teams/${location}`;
        break;
      case 'allteams':
        url = `${basePath}/teams`;
        break;
      default:
        throw new Error('Invalid information type requested');
    }
    console.log(`api url: ${url}`);
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Error fetching ESPN sports data: ", error.message);
    return { error: error.message };
  }
}

module.exports = { get_espn_sports };