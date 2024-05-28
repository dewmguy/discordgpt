// get_flightstatus.js

const fetch = require('node-fetch');

const get_flightstatus = async ({ flightICAO }) => {
  console.log("get_flightstatus function was called");
  try {
    const url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_APIKEY}&flight_icao=${flightICAO}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    const result = data.data[0];
    console.log(`result: ${JSON.stringify(result)}`);
    if (!result) { throw new Error('No data returned for the given flight ICAO'); }
    return result;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_flightstatus };