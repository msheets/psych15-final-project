var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function scrapeBillboard(endPoint, numWeeks, callback) {
	var baseURL = "http://www.billboard.com";
	var startURL = baseURL + endPoint;
	
	var weeks = [];

	function makeRequest(url) {
		request(url, function(err, resp, body) {
			$ = cheerio.load(body);
			var prev = $(".header_meta .prev a").first().attr("href");
			var chartDate = $(".header_meta .chart_date").text().trim();
			
			var songs = $(".listing.chart_listing article.song_review header");

			var listings = [];
			songs.each(function() {
				// Collect Basic Info
				var song = $(this),
					name = song.children("h1").first().text().trim(),
					artist = song.find(".chart_info a").first().text().trim(),
					position = +song.find(".chart_position").text().trim();

				// in case artist isn't in link
				if (artist == "")
					artist = song.find(".chart_info").first().text().trim();

				// Collect Spotify and rdio IDs for varication
				var streamingLinks = song.find(".options > li").filter(function() {
					return $(this).children("span").first().text().trim() == "Listen";
				}).first().find("a");

				var ids = [];
				streamingLinks.each(function() {
					var link = $(this)
						linkName = link.text().trim(),
						href = link.attr("href").trim(),
						id = "";

					switch (linkName) {
						case "Spotify":
							id = href.replace("/play/spotify/","");
							ids.push({ resource: "spotify", id: id });
							break;
						case "Rdio":
							id = href.match("(tid=[^&]*)")[1];
							ids.push({ resource: "rdio", id: id });
							break;
					}
				})

				var listing = { name: name, artist: artist, position: position, ids: ids };
				listings.push(listing);
			});

			weeks.push({
				date: chartDate,
				listings: listings
			});

			console.log((weeks.length / numWeeks * 100).toFixed(0) + "% Complete");

			if (prev && weeks.length < numWeeks)
				makeRequest(baseURL + prev);
			else {
				console.log("Stopped after " + weeks.length + " of " + numWeeks);
				callback(weeks);
			}
		});
	}

	makeRequest(startURL);
}

// default settings
var numWeeks = 52 * 3, // 3 years
	endPoint = "/charts/streaming-songs", // streaming
	outputFile = "../data/streaming-billboard.json";

// Allow command line modification for Hot 100
if (process.argv[2] && process.argv[2] == 'hot100') {
	numWeeks = 52 * 50;
	endPoint = "/charts/hot-100";
	outputFile = '../data/hot100-billboard.json';
}

scrapeBillboard(endPoint, numWeeks, function(weeks) {
	console.log("Writing final results to " + outputFile);
	var blobText = JSON.stringify(weeks);
	fs.writeFile(outputFile, blobText, function(err) {
	    if(err) return console.log(err);
        console.log("Success!");
	});
});