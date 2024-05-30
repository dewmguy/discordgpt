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