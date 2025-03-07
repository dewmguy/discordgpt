// get_title.js

const { get_tmdb_imdb } = require('./themoviedb/get_tmdb_imdb');
const { function_puppet } = require('./function_puppet');
const { function_sftp } = require('./function_sftp');
const { function_vpn } = require('./function_vpn');
const { function_library } = require('./function_library');

const get_title = async ({ url }) => {
  try {
    //console.log("[get_title] Function called");
    //console.log(`[get_title] Processing: ${url}`);
    
    const { media, title, year } = await get_tmdb_imdb({ imdbURL: url });
    console.log(`[get_title] Extracted data: ${title} ${year} (${media})`);

    const search = await function_library({ media, title, year });
    if (search) return { error: `tell the user: ${title} (${year}) already exists in the ${media} library.` }

    const connected = await function_vpn("connect");
    if (!connected) return { error: "VPN connection failed" };
    let ip = await function_vpn("checkip");
    console.log(ip);

    const filePath = await function_puppet({ media, title, year });
    if (!filePath || filePath.error) {
      console.error(`[get_title]: ${filePath.error}`);
      const disconnect = await function_vpn("disconnect");
      if (!disconnect) return { error: "VPN disconnection failed (1)" };
      return { error: filePath.error };
    }
    console.log(`[get_title] File processed at path: ${JSON.stringify(filePath)}`);
    const sftpResult = await function_sftp({ filePath });
    if (sftpResult && sftpResult.error) {
      console.error(`[get_title]: ${sftpResult.error}`);
      return { error: sftpResult.error };
    }
    console.log("[get_title] File successfully uploaded via SFTP.");
    
    const disconnected = await function_vpn("disconnect");
    if (!disconnected) return { error: "VPN disconnection failed (2)" };
    ip = await function_vpn("checkip");
    console.log(ip);

    return `✅ Done.`;
  }
  catch (error) {
    console.error("[get_title]:", error);
    return { error: error.message };
  }
};

module.exports = { get_title };

/*
{
  "name": "get_title",
  "description": "Processes information about a link from IMDB, extracts a title, processes a related file, and uploads it via SFTP.",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The URL of the IMDB page."
      }
    },
    "required": [
      "url"
    ]
  }
}
*/
