// get_elevation.js

const { get_coordinate } = require('./get_coordinate');

const get_elevation = async ({ latitude, longitude }) => {
  console.log("get_elevation function was called");

  try {
    const elevationURL = `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`;
    const response = await fetch(elevationURL);
    const elevationResponse = await response.json();
    const elevation = elevationResponse.results[0].elevation;
    console.log(`elevation at ${latitude}, ${longitude} is ${elevation} meters`);
    return elevation;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_elevation };

// not a function call