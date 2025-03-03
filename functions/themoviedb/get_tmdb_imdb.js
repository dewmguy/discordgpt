// get_tmdb_imdb.js

const { function_fetch } = require('../function_fetch.js');

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.THEMOVIEDB_APIKEY}`
  }
};

const get_tmdb_imdb = async ({ imdbURL }) => {
  try {
    //console.log(`[get_tmdb_imdb] Function called`);
    const regex = /^https?:\/\/(www\.)?imdb\.com\/title\/(tt\d+)(\/|\?|$)/;
    const match = imdbURL.match(regex);
    if (!match) { throw new Error("Invalid IMDB URL format."); }
    const imdbID = match[2];
    if (!imdbID || !/^tt\d+$/.test(imdbID)) { throw new Error("Invalid IMDb ID format."); }
    //console.log(`[get_tmdb_imdb] IMDB ID: ${imdbID}`);
    const response = await function_fetch(`https://api.themoviedb.org/3/find/${imdbID}?external_source=imdb_id`, options);
    if (!response || !response.movie_results || response.movie_results.length === 0) { throw new Error("No movie data found for the provided IMDb ID."); }
    const movie = response.movie_results[0];
    const title = movie.title || null;
    const year = movie.release_date.split('-')[0] || null;
    if (!title || !year) { throw new Error("Movie title or release year missing from TMDB response."); }
    return { title, year };
  }
  catch (error) {
    console.error(`[get_tmdb_imdb] Error:`, error);
    return { error: error.message };
  }
};

module.exports = { get_tmdb_imdb };