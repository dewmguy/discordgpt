// get_coordinate.js

const fetch = require('node-fetch');
const { get_gptresponse } = require('./get_gptresponse');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY

const get_coordinate = async ({ location }) => {
  console.log("get_coordinate function was called");
  console.log(`getting coords for ${location}`);

  try {
    const directive = `Your objective is to validate the accuracy of or correct location data in the form of a city name. If the input does not appear to be a city name, determine the city a stated point of interest is located within or is nearest to. Your output will not be read by a human, simply return the city name. The state or other information is not required. Thanks.`;
    let city = await get_gptresponse(directive, location);
    console.log(`corrected ${location} to ${city}`);
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_APIKEY}`;
    let response = await fetch(url);
    const data = await response.json();
    const result = data[0];
    if (!result) {
      throw new Error(`location ${city} is not a valid location name.`);
    }
    console.log(`latitude: ${result.lat}, longitude: ${result.lon}`);
    return { latitude: result.lat, longitude: result.lon };
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_coordinate };