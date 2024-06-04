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
    console.error("Error in get_weather:", error);
    return { error: error.message };
  }
};

module.exports = { get_weather };

/*
{
  "name": "get_weather",
  "description": "Retrieve weather reports from OpenWeather API. Useful when asked about current or forecast weather information. Write output in the style of a weather report from a meteorologist. Round all numerical points of data to the nearest whole digit.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state."
      },
      "report": {
        "type": "string",
        "description": "The type of weather report.",
        "enum": [
          "current",
          "forecast"
        ]
      }
    },
    "required": [
      "location",
      "report"
    ]
  }
}
*/