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
    console.error('Error:', error);
    throw new Error(`Debug: ${error}`);
  }
}

module.exports = { get_themoviedb };

/*
{
  "name": "get_themoviedb",
  "description": "This function connects to The Movie Database API to fetch information about movies, TV shows (Series, Seasons, and Episodes), and people (actors, directors, etc.).",
  "parameters": {
    "type": "object",
    "properties": {
      "mediaType": {
        "type": "string",
        "description": "The type of inquiry in question, whether it's about a movie, tv show, or person (actor, director, etc.).",
        "enum": ["movie","tv","person"]
      },
      "infoType": {
        "type": "string",
        "description": "The type of information about the media in question. Search will pull up several results based on the query. Popular and Trending are similar, trending is relevant to the current week whereas popular is relevant to all time. nowPlaying will show what's in theaters. upcoming is for movies soon to be released in theaters. tvDetails, seasonDetails, and episodeDetails will all provide a different specificity of information regarding a tv show.",
        "enum": ["search","nowPlaying","popular","topRated","upcoming","trending","tvDetails","seasonDetails","episodeDetails"]
      },
      "query": {
        "type": "string",
        "description": "Required for infoType 'search'. The search query related to the mediaType in question. For example, the name of the actor, movie, or show."
      },
      "year": {
        "type": "number",
        "description": "The year of release of the media in question. Query the user for specificity or make your best educated guess."
      },
      "season": {
        "type": "number",
        "description": "If applicable, the season number for TV shows. Required for seasonDetails and episodeDetails."
      },
      "episode": {
        "type": "number",
        "description": "If applicable, the episode number for TV shows. Required for episodeDetails."
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

/**
 * This function is an async function that connects to The Movie Database API to fetch information about movies, TV shows, and people.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.mediaType - The type of inquiry (movie, tv, person).
 * @param {string} params.infoType - The type of information about the media in question.
 * @param {string} params.query - The search query related to the mediaType in question.
 * @param {number} params.year - The year of release of the media in question.
 * @param {number} [params.season] - The season number for TV shows.
 * @param {number} [params.episode] - The episode number for TV shows.
 * @return {Promise<Object>} A promise that resolves to the JSON response from the API.
 */