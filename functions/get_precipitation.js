//faux code

const get_precipitation = (args) => {
  console.log("get_precipitation was called");
  let location = args.location || "HongKong";
  return {
    "success": true,
    "location": location,
    "precipitation": "50% chance of rain",
  };
};

module.exports = { get_precipitation };

/*real code

const { get_coordinate } = require("./get_coordinate.js");
const OPENWEATHER_API_KEY = process.env.OPENWEATHERAPIKEY;

const get_weather = async (args) => {
  console.log("get_time was called");

  try {
    // Default values
    const { location = "Hong Kong", unit = "c" } = args;
    let geoInfo = await get_coordinate({ location });
    if (geoInfo.error) { throw new Error(geoInfo.error); }

    let { latitude, longitude } = geoInfo;
    const respond = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`);

    return await respond.json();
  } catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }

};

module.exports = { get_weather };

*/
