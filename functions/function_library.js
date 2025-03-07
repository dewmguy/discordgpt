const { function_fetch } = require('./function_fetch');

const function_library = async ({ media, title, year }) => {
  try {
    const url = new URL(process.env.LIBRARY_APIURL);
    url.searchParams.append('apikey', process.env.LIBRARY_APIKEY);
    url.searchParams.append('cmd', 'search');
    url.searchParams.append('query', title);
    url.searchParams.append('limit', '1');
    url.searchParams.append('out_type', 'json');

    const response = await function_fetch(url.href, { method: 'GET' });

    if (!response || response.response.result !== 'success') {
      throw new Error('Failed to retrieve data from library.');
    }

    const results = response.response.data.results_list;
    const content = media === "movie" ? results.movie[0] : media === "tv" ? results.show[0] : null;
    //console.log(results);

    //console.log(`[function_library] ${media} ${title} ${year}`);
    //console.log(`[function_library] ${content.media_type} ${content.title} ${content.year}`);

    if (((media === "tv") && content.media_type === "show" || (media === "movie" && content.media_type === media)) && content.title === title && content.year === year) {
      //console.log(`Content "${title}" found in library.`);
      return true;
    }
    else {
      //console.log(`Content "${title}" not found in library.`);
      return false;
    }
  }
  catch (error) {
    console.error('[function_library] Error searching for content:', error.message);
    return 'Error searching for content.';
  }
};

module.exports = { function_library };

//function_library({ media: "tv", title: "Lost", year: "2004" });