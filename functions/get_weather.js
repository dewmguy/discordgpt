//faux code

const simple_get_weather = (args) => {
  console.log("get_weather was called");
  let location = args.location || "HongKong";
  let unit = args.unit || "c";
  return {
    "success": true,
    "location": location,
    "temperature": "18",
    "unit": unit
  };
};

let get_weather = simple_get_weather;
module.exports = { get_weather };

/*real code

const { get_coordinate } = require("./get_coordinate.js");
const OPENWEATHER_API_KEY = process.env.OPENWEATHERAPIKEY;

const real_get_weather = async (args) => {
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

let get_weather = real_get_weather;
module.exports = { get_weather };

*/