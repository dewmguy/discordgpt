/*
//baseball api
var request = require('request');
var options = {
  'method': 'GET',
  'url': 'https://v1.baseball.api-sports.io/teams/statistics?league=1&season=2019&team=5',
  'headers': {
    'x-rapidapi-key': process.env.BASEBALLAPI_APIKEY,
    'x-rapidapi-host': 'v1.baseball.api-sports.io'
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});

//basketball api
const url = 'https://api-basketball.p.rapidapi.com/timezone';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': process.env.BASKETBALLAPI_APIKEY,
		'X-RapidAPI-Host': 'api-basketball.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
*/