// get_title.js

const { get_tmdb_imdb } = require('./themoviedb/get_tmdb_imdb');
const { function_puppet } = require('./function_puppet');
const { function_sftp } = require('./function_sftp');

const get_title = async ({ url }) => {
  try {
    //console.log("[get_title] Function called");
    //console.log(`[get_title] Processing: ${url}`);

    const { title, year } = await get_tmdb_imdb({ imdbURL: url });
    if (!title || !year) { throw new Error("Title extraction failed"); }
    //console.log(`[get_title] Extracted data: ${title} ${year}`);

    const filePath = await function_puppet({ title, year });
    if (filePath.error) { throw new Error(filePath.error); }
    //console.log(`[get_title] File processed at path: ${JSON.stringify(filePath)}`);

    // Upload the file via SFTP
    const sftpResult = await function_sftp({ filePath });
    if (sftpResult.error) { throw new Error(sftpResult.error); }
    //console.log("[get_title] File successfully uploaded via SFTP.");

    return { success: "File processing complete." };
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
