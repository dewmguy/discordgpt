// get_coordinate.js

const fetch = require('node-fetch');
const { get_gptresponse } = require('./get_gptresponse');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY

const get_coordinate = async ({ location }) => {
  console.log("get_coordinate function was called");

  try {
    const directive = `Your objective is to validate the accuracy of, or correct location data in the form of, a city name. If the input does not appear to be a city name, determine the city a stated point of interest is located within or is nearest to. Your output will not be read by a human, simply return the city name. The state or other information is not required. Thanks.`;
    let city = await get_gptresponse(directive, location);
    console.log(`validated ${location} to ${city}`);
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_APIKEY}`;
    let response = await fetch(url);
    const data = await response.json();
    const result = data[0];
    console.log(`latitude: ${result.lat}, longitude: ${result.lon}`);
    return { latitude: result.lat, longitude: result.lon };
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_coordinate };

// not a function call

/**
 * This function is an async function that takes an object with a `location` property.
 * It uses the OpenWeatherMap API to get the coordinates of a city based on the provided location.
 * 
 * @async
 * @param {object} options - An object with a `location` property.
 * @param {string} options.location - The name of the city to get the coordinates of.
 * @returns {Promise<object|object>} - A Promise that resolves to an object with `latitude` and `longitude` properties
 *                                    if the location is valid, or an object with an `error` property if the location is invalid.
 */