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
  catch (error) { return { error: error.message }; }
}

module.exports = { get_solarlunar };

/*
{
  "name": "get_moon",
  "description": "This function connects to the Moon API to retrieve current information about the moon based on my location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city name of the user's location"
      },
      "body": {
        "type": "string",
        "description": "Either the sun or the moon.",
        "enum": ["sun","moon"]
      }
    },
    "required": [
      "location",
      "body"
    ]
  }
}
*/