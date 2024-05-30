// get_espn_sports.js

const fetch = require('node-fetch');

// openai
const { get_gptresponse } = require('./get_gptresponse');

const get_espn_sports = async ({ sport, league, infoType, team, location, playerName, season }) => {
  try {
    console.log(`get_espn_sports function was called`);
    console.log(`variables in place: sport(${sport}), league(${league}), infoType(${infoType}), team(${team}), location(${location}), playerName(${playerName}), season(${season})`);

    if(!location && sport && league && infoType == 'team') {
      const searchQuery = `need location data for ${sport} ${league} ${team}`;
      console.log(`location data needed for query: ${searchQuery}`);
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
      case 'scores': // data.events
        url = `${basePath}/scoreboard`;
        break;
      case 'team': // data.team
        url = `${basePath}/teams/${location}`;
        break;
      case 'allteams': // data.sports[0].leagues[0]
        url = `${basePath}/teams`;
        break;
      case 'playerStats':
      case 'playerBio':
        const teamURL = `${basePath}/teams/${location}`;
        const teamResponse = await fetch(teamURL);
        console.log(`fetching team id from ${teamURL}`);
        const teamData = await teamResponse.json();
        const teamID = teamData.team.id;
        console.log(`team id = ${teamID}`);
        const rosterURL = `https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/${season}/teams/${teamID}/athletes`;
        const rosterResponse = await fetch(rosterURL);
        console.log(`fetching data from ${rosterURL}`);
        const rosterData = await rosterResponse.json();
        let playerBio, playerStats;

        for (let playerRef of rosterData.items) {
          const playerResponse = await fetch(playerRef.$ref);
          const playerData = await playerResponse.json();
          console.log(`Checking player: ${playerData.fullName}`);
          if (playerName && (playerData.fullName === playerName || playerData.lastName === playerName)) {
            console.log(`Player match found: ${playerData.fullName}`);
            playerBio = playerData;
            if(infoType == 'playerBio' && playerBio) { return playerBio; break; }
          }
        }
        if(infoType == 'playerStats' && playerBio) {
          let playerID = playerBio.id;
          const statsURL = `http://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league}/seasons/${season}/types/2/athletes/${playerID}/statistics?lang=en&region=us`;
          const statsResponse = await fetch(statsURL);
          console.log(`fetching stats data from ${statsURL}`);
          const statsData = await statsResponse.json();
          return statsData;
        }
        break;
      default:
        throw new Error('Invalid information type requested');
    }
    if(infoType !== 'player') {
      console.log(`api url: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      data = await response.json();
      if(infoType == 'scores') { data = data.events; }
      if(infoType == 'team') { data = data.team; }
      if(infoType == 'allteams') { data = data.sports[0].leagues[0]; }
    }
    return data;
  }
  catch (error) {
    console.error("Error fetching ESPN sports data: ", error.message);
    return { error: error.message };
  }
}

module.exports = { get_espn_sports };

/*
{
  "name": "get_espn_sports",
  "description": "This function connects to the ESPN API for access to a plethora of information about American sports.",
  "parameters": {
    "type": "object",
    "properties": {
      "sport": {
        "type": "string",
        "description": "The sport being requested.",
        "enum": [
          "football",
          "baseball",
          "hockey",
          "basketball"
        ]
      },
      "league": {
        "type": "string",
        "description": "The league being requested.",
        "enum": [
          "nfl",
          "mlb",
          "nhl",
          "nba",
          "wnba",
          "college-football",
          "college-basketball",
          "womens-college-basketball",
          "mens-college-basketball"
        ]
      },
      "infoType": {
        "type": "string",
        "description": "Type of information requested.",
        "enum": [
          "news",
          "scores",
          "team",
          "allteams",
          "playerBio",
          "playerStats"
        ]
      },
      "team": {
        "type": "string",
        "description": "If applicable, the name of the team in question."
      },
      "location": {
        "type": "string",
        "description": "If applicable, the location of the team in question. Professional sports inquiries requires the name of the city and college sports inquries requires the name of the state."
      },
      "playerName": {
        "type": "string",
        "description": "If applicable, the first and last name of the player in question."
      },
      "season": {
        "type": "string",
        "description": "If applicable, the year of the league season in question. Default to current year."
      }
    },
    "required": [
      "sport",
      "league",
      "infoType",
      "location",
      "season"
    ]
  }
}
*/

/**
 * This function is a wrapper for the ESPN API, which provides various sports-related information. 
 * It takes in parameters such as the sport, league, infoType, location, and season of interest, 
 * and returns the corresponding information from the ESPN database. 
 * 
 * Parameters:
 * - sport: The sport being requested. (string)
 * - league: The league being requested. (string)
 * - infoType: The type of information requested. (string)
 * - location: The location of the team in question. Professional sports inquiries require the name of the city, 
 *   while college sports inquiries require the name of the state. (string)
 * - season: The year of the league season in question. Default to current year. (string)
 * 
 * Returns:
 * - The requested information from the ESPN database.
 */