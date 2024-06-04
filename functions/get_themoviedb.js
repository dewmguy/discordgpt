// get_themoviedb.js

require('dotenv').config();

const fetch = require('node-fetch');

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.THEMOVIEDB_APIKEY}`
  }
};

async function fetchData(url, options) {
  try {
    const response = await fetch(url, options);
    return await response.json();
  }
  catch (error) {
    console.error('Error:', error);
    throw new Error(`Debug: ${error}`);
  }
}

async function getMediaID(mediaType, infoType, query, year) {
  try {
    const url = `https://api.themoviedb.org/3/search/${mediaType}?query=${query}&include_adult=false&language=en-US&page=1${year ? `&primary_release_year=${year}` : ''}`;
    const response = await fetchData(url, options);
    const id = response.results[0]?.id;
    if (!id) { throw new Error('Media ID not found'); }
    console.log(`id = ${id} for mediaType ${mediaType}`);
    return id;
  }
  catch (error) {
    console.error('Error:', error);
    throw new Error(`Debug: ${error}`);
  }
}

const get_themoviedb = async ({ mediaType, infoType, query, year, season, episode }) => {
  try {
    console.log("get_themoviedb function was called");
    console.log(`calling mediaType = ${mediaType}, infoType = ${infoType}, query = ${query}`);

    let url = '';
    let mediaID = '';

    if (infoType === 'search') { mediaID = await getMediaID(mediaType, infoType, query, year); }

    switch (infoType) {
      case 'search':
        url = `https://api.themoviedb.org/3/search/${mediaType}?query=${query}&include_adult=false&language=en-US&page=1&year=${year}`;
        break;
      case 'trending':
        url = `https://api.themoviedb.org/3/trending/${mediaType}/week?language=en-US`;
        break;
      case 'nowPlaying':
        url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1`;
        break;
      case 'popular':
        url = `https://api.themoviedb.org/3/${mediaType}/popular?language=en-US&page=1`;
        break;
      case 'topRated':
        url = `https://api.themoviedb.org/3/${mediaType}/top_rated?language=en-US&page=1`;
        break;
      case 'upcoming':
        url = `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1`;
        break;
      case 'tvSeriesDetails':
        url = `https://api.themoviedb.org/3/tv/${mediaID}?language=en-US`;
        break;
      case 'tvSeasonDetails':
        url = `https://api.themoviedb.org/3/tv/${mediaID}/season/${season}?language=en-US`;
        break;
      case 'tvEpisodeDetails':
        url = `https://api.themoviedb.org/3/tv/${mediaID}/season/${season}/episode/${episode}?language=en-US`;
        break;
      default:
        throw new Error('Invalid infoType provided');
    }

    return await fetchData(url, options);
  }
  catch (error) {
    console.error("Error in get_themoviedb:", error);
    return { error: error.message };
  }
}

module.exports = { get_themoviedb };

/*
{
  "name": "get_themoviedb",
  "description": "Retrieve information about TV Shows, Movies, and People from The Movie Database API. Useful when asked about movies, tv shows (series, seasons, or episodes), or people (actors, directors, etc).",
  "parameters": {
    "type": "object",
    "properties": {
      "mediaType": {
        "type": "string",
        "description": "The category.",
        "enum": [
          "movie",
          "tv",
          "person"
        ]
      },
      "infoType": {
        "type": "string",
        "description": "The information to request. 'search' retrieves results based on the query parameter. 'popular' retrieves a list of results of all time. 'trending' retrieves a list of results of the current week. 'nowPlaying' retrieves a list of movies in theaters. 'upcoming' retrieves a list of movies soon to be in theaters. 'tvDetails', 'seasonDetails', and 'episodeDetails' retrieves tv show data respective to the scope of specificity.",
        "enum": [
          "search",
          "nowPlaying",
          "popular",
          "topRated",
          "upcoming",
          "trending",
          "tvDetails",
          "seasonDetails",
          "episodeDetails"
        ]
      },
      "query": {
        "type": "string",
        "description": "The name of the person, movie, or show. Required for 'search' infoType parameter."
      },
      "year": {
        "type": "number",
        "description": "The release year of the media. Query the user or make your best educated guess."
      },
      "season": {
        "type": "number",
        "description": "The season number, when applicable. Required for 'seasonDetails' and 'episodeDetails' infoType parameter."
      },
      "episode": {
        "type": "number",
        "description": "The episode number, when applicable. Required for 'episodeDetails' infoType parameter."
      }
    },
    "required": [
      "mediaType",
      "infoType",
      "year"
    ]
  }
}
*/