// get_weather.js

const fetch = require('node-fetch');
const { get_coordinate } = require('./get_coordinate');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;

const get_weather = async ({ location, report }) => {
  console.log("get_weather was called");
  try {
    console.log(`getting coordinates for ${location}`);
    let coordinates = await get_coordinate({ location });
    if (coordinates.error) throw new Error(coordinates.error);
    let { latitude, longitude } = coordinates;
    let excludeParts = "minutely,alerts";
    if (report === "current") { excludeParts += ",daily,hourly"; }
    else if (report === "forecast") { excludeParts += ",current"; }
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=${excludeParts}&units=imperial&appid=${OPENWEATHER_APIKEY}`;
    const response = await fetch(weatherUrl);
    const weatherData = await response.json();
    return weatherData;
  }
  catch (error) {
    console.log(error.message);
    return { error: error.message };
  }
};

module.exports = { get_weather };

/*
{
  "name": "get_weather",
  "description": "This function connects to the OpenWeatherMap API to retrieve weather information about a given location. Completely rewrite the output to sound like a meteorologist's weather report based on the request. Round all numerical points of data to the nearest whole digit.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state in question."
      },
      "report": {
        "type": "string",
        "description": "The type of weather information being requested.",
        "enum": ["current","forecast"]
      }
    },
    "required": [
      "location",
      "report"
    ]
  }
}
*/

/**
 * This function is an async function that takes an object with a `location` and `report` property.
 * It uses the OpenWeatherMap API to get weather information about a given location.
 * 
 * @async
 * @param {object} options - An object with a `location` and `report` property.
 * @param {string} options.location - The name of the city and state in question.
 * @param {string} options.report - The type of weather information being requested. It can be "current" or "forecast".
 * @returns {Promise<object|object>} - A Promise that resolves to an object with weather information if the location is valid, or an object with an `error` property if the location is invalid.
 */