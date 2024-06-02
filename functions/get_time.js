// get_time.js

const fetch = require('node-fetch');

const get_time = async ({ area, location, region }) => {
  console.log("get_time function was called");
  try {
    if(!region) { region = ''; }
    const url = `http://worldtimeapi.org/api/timezone/${area}/${location}/${region}`;
    console.log(url);
    const response = await fetch(url);
    const result = await response.json();
    console.log(result);
    
    if (result) {
      const timeData = {
        zone: result.timezone,
        region: result.abbreviation,
        time: result.datetime,
        dst_start: result.dst_from,
        dst_stop: result.dst_until
      };
      console.log(timeData);
      return timeData;
    }
    else {
      if(!area) { area = '<missing>'; }
      if(!location) { location = '<missing>'; }
      if(!region) { region = '<region>'; }
      throw new Error(`No data found for ${area}/${location}/${region}`);
    }
  }
  catch (error) {
    console.error(error);
    return error;
  }
};

module.exports = { get_time };

/*
{
  "name": "get_time",
  "parameters": {
    "type": "object",
    "properties": {
      "area": {
        "type": "string",
        "description": "The time zone category, referred to by the continent (i.e. America) or a generic time area (i.e. MST).",
        "enum": ["Africa","America","Antarctica","Asia","Atlantic","Australia","Europe","Indian","Pacific","CET","EET","EST","ETC","HST","MET","MST","WET"]
      },
      "location": {
        "type": "string",
        "description": "The time zone location, referred to by the city name (i.e. Denver) or in specific instances the name of the state (e.g. Argentina, Indiana, Kentucky, and North_Dakota)."
      },
      "region": {
        "type": "string",
        "description": "A tertiary option required only when the location contains a state."
      }
    },
    "required": ["area"]
  },
  "description": "This function connects to the World Time API to determine the time in any location provided the area, location, and sometimes the region. For example: In the timezone 'America/Denver', America is the area and Denver is the location. Other examples would include a region, such as America/Argentina/Salta."
}
*/