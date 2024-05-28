// get_coordinate.js

const fetch = require('node-fetch');
const { get_gptresponse } = require('./get_gptresponse');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY

const get_coordinate = async ({ city }) => {
  console.log("get_coordinate function was called");
  console.log(`getting coords for ${city}`);
  try {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_APIKEY}`;
    let response = await fetch(url);
    const data = await response.json();
    const result = data[0];
    if (!result) {
      console.log(`${city} is not a valid location. correcting.`);
      const directive = `Your objective is to determine the city a stated point of interest is located within or is nearest to. Your output will not be read by a human, simply return the city name. The state or other information is not required. Thanks.`;
      city = await get_gptresponse(directive, city);
      city = city.trim().toLowerCase();
      console.log(`getting coords for ${city}`);
      response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_APIKEY}`);
      const data = await response.json();
      const result = data[0];
    }
    console.log(`latitude: ${result.lat}, longitude: ${result.lon}`);
    return { latitude: result.lat, longitude: result.lon };
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_coordinate };