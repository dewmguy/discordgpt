// get_weather.js

const fetch = require('node-fetch');
const { get_coordinate } = require('./get_coordinate');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;

const get_weather = async ({ location, report }) => {
  console.log("get_weather was called");
  try {
    const city = location.split(',')[0];
    let coordinates = await get_coordinate({ city });
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