// get_solarlunar.js

const fetch = require('node-fetch');
const { get_coordinate } = require('./get_coordinate.js');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_solarlunar = async ({ location, body }) => {
  console.log("get_solarlunar function was called");
  
  let coordinates = await get_coordinate({ location });
  if (coordinates.error) throw new Error(coordinates.error);
  let { latitude, longitude } = coordinates;
  
  try {
    const url = `https://moon-phase.p.rapidapi.com/advanced?lat=${latitude}&lon=${longitude}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'moon-phase.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.json();
    let moon, sun;

    if(body === 'sun') {
      sunResult = result.sun;
      console.log(sunResult);
      return sunResult;
    }
    if(body === 'moon') {
      moonResult = { moon_data: result.moon, moon_phases: result.moon_phases };
      console.log(moonResult);
      return moonResult;
    }
  }
  catch (error) {
    console.error("Error in get_solarlunar:", error);
    return { error: error.message };
  }
}

module.exports = { get_solarlunar };

/*
{
  "name": "get_solarlunar",
  "description": "Retrieves current lunar or solar data from Moon API. Useful when asked about any solar or lunar activity.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The name of the city. Required. Ask for the location."
      },
      "body": {
        "type": "string",
        "description": "The celestial body.",
        "enum": [
          "sun",
          "moon"
        ]
      }
    },
    "required": [
      "location",
      "body"
    ]
  }
}
*/