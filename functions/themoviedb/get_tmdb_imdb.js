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
    const regex = /^https?:\/\/(m\.|www\.)?imdb\.com\/title\/(tt\d+)(\/|\?|$)/;
    const match = imdbURL.match(regex);
    if (!match) { throw new Error("Invalid IMDB URL format."); }
    const imdbID = match[2];
    if (!imdbID || !/^tt\d+$/.test(imdbID)) { throw new Error("Invalid IMDb ID format."); }
    console.log(`[get_tmdb_imdb] IMDB ID: ${imdbID}`);
    const response = await function_fetch(`https://api.themoviedb.org/3/find/${imdbID}?external_source=imdb_id`, options);
    if (!response) { throw new Error("No data found for the provided IMDb URL."); }
    let data = response.movie_results[0] || response.tv_results[0] || null;
    let media = data?.media_type || null;
    let title = data?.title || data?.name || null;
    let year = data?.release_date?.split('-')[0] || null;
    if (media === "tv" && !title) { throw new Error("TV show title missing from TMDB response."); }
    if (media === "movie" && (!title && !year)) { throw new Error("Movie title or release year missing from TMDB response."); }
    if (!media) { throw new Error("Media information missing from TMDB response"); }
    return { media, title, year };
  }
  catch (error) {
    console.error(`[get_tmdb_imdb] Error:`, error);
    return { error: error.message };
  }
};

module.exports = { get_tmdb_imdb };
