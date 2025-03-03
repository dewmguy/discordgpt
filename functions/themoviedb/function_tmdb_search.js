// function_tmdb_search.js

const { function_fetch } = require('../function_fetch.js');

const function_tmdb_search = async (endpoint, query, year, options) => {
  console.log("[function_tmdb_search] Function called");
  try {
    let urlYear = year ? `&year=${year}` : '';
    const url = `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1${urlYear}`;
    const response = await function_fetch(url, options);
    const id = response.results[0]?.id;
    if (!id) { throw new Error('Media ID not found'); }
    console.log(`[function_tmdb_search] Retrieved ID: ${id}`);
    return id;
  }
  catch (error) {
    console.error("[function_tmdb_search] Error:", error);
    return { error: error.message };
  }
}

module.exports = { function_tmdb_search };

// not a function call