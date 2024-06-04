// get_flight.js

const fetch = require('node-fetch');

const get_flight = async ({ flightICAO }) => {
  console.log("get_flight function was called");
  try {
    const url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_APIKEY}&flight_icao=${flightICAO}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    const result = data.data[0];
    console.log(`result: ${JSON.stringify(result)}`);
    if (!result) { throw new Error('No data returned for the given flight ICAO'); }
    return result;
  }
  catch (error) {
    console.error("Error in get_flight:", error);
    return { error: error.message };
  }
}

module.exports = { get_flight };

/*
{
  "name": "get_flight",
  "description": "Retrieves complete real-time flight status data from Aviation Stack API. Write output in the style of an airline captain speaking over the intercom. Convert dates and times into human-friendly readable format.",
  "parameters": {
    "type": "object",
    "properties": {
      "flightICAO": {
        "type": "string",
        "description": "The Flight ICAO identifier of the flight. (e.g. The Flight ICAO for 'South West flight 1234' is SWA1234.)"
      }
    },
    "required": [
      "flightICAO"
    ]
  }
}
*/