// get_weather.js

const fetch = require('node-fetch');
const { get_gptresponse } = require('./get_gptresponse');
const { get_coordinate } = require('./get_coordinate');
const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;

const get_weather = async (args) => {
    console.log("get_weather was called");
    try {
        const { location = "Denver, CO", unit = "imperial" } = args;
        const cityName = location.split(',')[0];
        
        let geoInfo = await get_coordinate({ cityName });
        if (geoInfo.error) throw new Error(geoInfo.error);

        let { latitude, longitude } = geoInfo;

        const excludeParts = "minutely,hourly,daily,alerts";
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=${excludeParts}&units=${unit}&appid=${OPENWEATHER_APIKEY}`;

        const response = await fetch(weatherUrl);
        const weatherData = await response.json();

        const directive = `You are a meteorologist, you can take complicated weather data and turn it into a simple, friendly, easy to digest, and personalized weather report. The user requests not to use lists and to convert complex units such as "hPa" into more understandable units or exclude them. The user will not be eligible to ask follow up questions so please make the report concise as a stand-alone message. Feel free to spruce it up with emojis!`;
        const data = JSON.stringify(weatherData);

        const humanFriendlyReport = await get_gptresponse(directive, data);
        console.log(humanFriendlyReport);
        return humanFriendlyReport;
    }
    catch (error) { return { error: error.message }; }
};

module.exports = { get_weather };