// get_coordinate.js

const fetch = require('node-fetch');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY

const get_coordinate = async ({ cityName }) => {
    console.log("get_coordinate function was called");
    try {
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${OPENWEATHER_APIKEY}`;
        const response = await fetch(url);
        const data = await response.json();
        const result = data[0];
        if (!result) throw new Error('No data returned for the given city name');
        return { latitude: result.lat, longitude: result.lon };
    }
    catch (error) { return { error: error.message }; }
}

module.exports = { get_coordinate };