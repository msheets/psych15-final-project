var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var extend = require('extend');
var querystring = require('querystring');

function queryEchonest(weeks, apiKey, callback) {
	var baseURL = 'http://developer.echonest.com/api/v4/';

	function makeRequest(endPoint, options, callback) {
		var url = baseURL + endPoint;

	    var data = { 
	        format:'json', 
	        api_key: apiKey,
	    };
	    data = extend(data, options);

	    var query = querystring.stringify(data);
	    url = url + "?" + query;

		request({ url: url, json: true }, callback);
	}

	// perform search in sequence to handle rate limits
	function search(weekIndex, listingIndex) {
		var listing = weeks[weekIndex].listings[listingIndex];

		// Update Artist name for search
		var artist = listing.artist;

		// Handle Special Cases
		if (artist == "Pharrell Williams")
			artist = "Pharrell";
		else if (artist == "Kanye West, Big Sean, Pusha T, 2 Chainz" && listing.name == 'Mercy')
			artist = "Kanye West";
		else if (artist == "Lana Del Rey & Cedric Gervais" && listing.name == 'Summertime Sadness')
			artist = "Lana Del Rey";
		else if (artist == "YG Featuring Jeezy & Rich Homie Quan" && listing.name == "My Hitta")
			artist = "Y.G.";
		else if (artist == "A Great Big World & Christina Aguilera" && listing.name == "Say Something") 
			artist = "A Great Big World";

		// General Artist Updates
		if (artist.indexOf(" Featuring ") != -1)
			artist = artist.slice(0, artist.indexOf(" Featuring "));		
		

		makeRequest("song/search", { artist: artist, title: listing.name, sort: "song_hotttnesss-desc", bucket: "audio_summary" }, function(err, resp, body) {
			if (err) return console.log(err);

			switch (body.response.status.code) {
				case 3: // response limit reached
					console.log("Rate limit exceeded. Inducing 60 seconds of sleep.")
					setTimeout(function() { search(weekIndex, listingIndex); }, 1000 * 60); // wait a minute and try again
					break;
				case 0:
					weeks[weekIndex].listings[listingIndex].echonest = (body.response.songs) ? body.response.songs[0] : {};
					if (!body.response.songs)
						console.log(body);

					listingIndex++;
					if (listingIndex >= weeks[weekIndex].listings.length) {
						weekIndex++;
						listingIndex = 0;
						if (weekIndex >= weeks.length) {
							callback(weeks);
							return;
						}
					}
					search(weekIndex, listingIndex);
					break;
				default:
					console.log("Unknown Response Code. Output: ");
					console.log(body);
			}
		});
	}

	search(0, 0);
}


// Default to Streaming Songs
var inputFile = '../data/streaming-billboard.json',
	outputFile = '../data/streaming-echonest.json';

// Allow command line modification for Hot 100
if (process.argv[2] && process.argv[2] == 'hot100') {
	inputFile = '../data/hot100-billboard.json';
	outputFile = '../data/hot100-echonest.json';
}

fs.readFile(inputFile, 'utf8', function(err, data) {
	if (err) return console.log(err);

	var weeks = JSON.parse(data);
  	console.log(inputFile + " read and data parsed");

  	fs.readFile('./apiKeys.json', 'utf8', function(err, data) {
  		if (err) return console.log(err);

  		var apiKeys = JSON.parse(data);
  		console.log("apiKeys.jon read and data parsed");
		
		queryEchonest(weeks, apiKeys.echonest, function(weeks) {
			console.log("Writing final results to " + outputFile);
		  	var blobText = JSON.stringify(weeks);
		  	fs.writeFile(outputFile, blobText, function(err) {
		    	if(err) return console.log(err);
		        console.log("Success!");
			});
		});  		
  	});
});