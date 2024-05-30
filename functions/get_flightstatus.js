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

/*
{
  "name": "get_flightstatus",
  "description": "This function connects to Aviation Stack API to retrieve details about a particular flight based on the given flight ICAO number. Completely rewrite the output the way a captain would speak over the intercom. Make it fun. Please convert all dates and times into more friendly readable format.",
  "parameters": {
    "type": "object",
    "properties": {
      "flightICAO": {
        "type": "string",
        "description": "The Flight ICAO identifier of the flight in question. Sometimes a user may not know the ICAO of the airline. For example: The ICAO for 'South West flight 1234' is SWA1234."
      }
    },
    "required": [
      "flightICAO"
    ]
  }
}
*/

/**
* This JavaScript code exports a single function called `get_flightstatus`. This function is an asynchronous function that takes an object
* as an argument with a property called `flightICAO`. When called, this function connects to the Aviation Stack API using the `node-fetch`
* library to retrieve details about a particular flight based on the given flight ICAO number. The function constructs a URL using the
* flightICAO value and the API key stored in the `AVIATIONSTACK_APIKEY` environment variable. It then makes a GET request to the API and
* parses the JSON response. If the response contains data, it returns the first element of the `data` array. If the response does not
* contain data, it throws an error. If an error occurs during the execution of the function, it returns an object with an `error` property
* containing the error message.
*/