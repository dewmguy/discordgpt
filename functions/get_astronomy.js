// get_astronomy.js

require('dotenv').config();

const axios = require('axios');
const ASTRONOMY_HASH = process.env.ASTRONOMY_HASH;
const { get_coordinate } = require('./get_coordinate.js');
const { get_elevation } = require('./get_elevation.js');
const { get_astronomy_search } = require('./get_astronomy_search.js');

const get_astronomy = async ({ dataType, bodyName, location, time, date, old_date }) => {
  console.log("get_astronomy function was called");

  try {
    const coordinates = await get_coordinate({ location });
    if (coordinates.error) throw new Error(coordinates.error);
    const { latitude, longitude } = coordinates;
    const elevation = await get_elevation({ latitude, longitude });

    let url = `https://api.astronomyapi.com/api/v2/${dataType}/`;
    let methodType = 'get';
    let body = {};

    if (dataType === 'search') {
      console.log(`searching for ${bodyName}`);
      return get_astronomy_search(bodyName, 'general', 5);
    }
    else if (dataType === 'bodies') {
      console.log(`retrieving position data for ${bodyName}`);
      url += `positions/${bodyName}?latitude=${latitude}&longitude=${longitude}&elevation=${elevation}&from_date=${old_date}&to_date=${date}&time=${time}`;
    }
    else if (dataType === 'studio') {
      console.log(`creating a star chart for ${bodyName}`);
      url += `star-chart`;
      methodType = 'post';
      const constID = await get_astronomy_search(bodyName, 'constellation', 1);
      console.log(`searched for ${bodyName} and recovered ${constID}`);
      body = {
        "style": "red",
        "observer": {
          "latitude": latitude,
          "longitude": longitude,
          "date": date
        },
        "view": {
          "type": "constellation",
          "parameters": {
            "constellation": constID
          }
        }
      };
    }
    console.log(`endpoint url ${url}`);

    const config = {
      method: methodType,
      url: url,
      headers: { 'Authorization': `Basic ${ASTRONOMY_HASH}` },
      data: body
    };
    console.log(config);

    const response = await axios.request(config);
    console.log(response.data);

    if (dataType === 'studio') {
      console.log(`image data: ${response.data.data.imageUrl}`);
      return response.data.data.imageUrl;
    }
    else { return response.data; }
  }
  catch (error) {
    console.error("Error in get_astronomy:", error);
    return { error: error.message };
  }
}

module.exports = { get_astronomy };

/*
{
  "name": "get_astronomy",
  "description": "Retrieves celestial object data from the Astronomy API. Useful when asked about the locations of planets, stars, galaxies, or constellations. Can generate star maps.",
  "parameters": {
    "type": "object",
    "properties": {
      "dataType": {
        "type": "string",
        "description": "The category of the query. 'bodies' retrieves data about planets in our solar system. 'studio' retrieves star-chart images displaying the locations of celestial objects like constellations and stars. 'search' retrieves data about stars or galaxies; not planets.",
        "enum": [
          "bodies",
          "studio",
          "search"
        ]
      },
      "bodyName": {
        "type": "string",
        "description": "The name of the celestial body. Planets, star, galaxies, or constellations."
      },
      "location": {
        "type": "string",
        "description": "The name of the city. Required. Ask for the location."
      },
      "time": {
        "type": "string",
        "description": "The current local time at the location. Format: HH:MM:SS"
      },
      "date": {
        "type": "string",
        "description": "The current date at the location. Also used as the newest date in a range. Format: YYYY-MM-DD"
      },
      "old_date": {
        "type": "string",
        "description": "The current date at the location. Also used as the oldest date in a range. Format: YYYY-MM-DD"
      }
    },
    "required": [
      "dataType",
      "location",
      "time",
      "date",
      "old_date"
    ]
  }
}
*/