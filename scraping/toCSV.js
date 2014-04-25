var fs = require('fs');

var inputFile = '../data/streaming-echonest.json',
    outputFile = '../data/streaming-echonest.csv';

if (process.argv[2] && process.argv[2] == 'hot100') {
    inputFile = '../data/hot100-echonest.json';
    outputFile = '../data/hot100-echonest.csv';
}

fs.readFile(inputFile, 'utf8', function(err, data) {
    if (err) return console.log(err);

    var weeks = JSON.parse(data);

    var csv = "date,season,acousticness,danceability,duration,energy,key,liveness,loudness,mode,speechiness,tempo,time_signature,valence\n";
    weeks.map(function(week) {

        var weekAvgs = {    
            acousticness: 0,
            danceability: 0,
            duration: 0,
            energy: 0,
            key: 0,
            liveness: 0,
            loudness: 0,
            mode: 0,
            speechiness: 0,
            tempo: 0,
            time_signature: 0,
            valence: 0
        };

        week.listings.map(function(listing) {
            if (listing.echonest) {
                var data = listing.echonest.audio_summary;

                for (var dataPoint in weekAvgs) {
                    weekAvgs[dataPoint] += data[dataPoint];
                }
            }
        });

        // average
        for (var dataPoint in weekAvgs) {
            weekAvgs[dataPoint] = weekAvgs[dataPoint] / week.listings.length;
        }

        var d = new Date(week.date);
        if (!d) console.log(week.date);
        
        csv += (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
    
        if (d.getMonth() < 3 || d.getMonth() >= 9) // october,november, december, january, febuary, march,
            csv += ",0";
        else
            csv += ",1"

        for (var dataPoint in weekAvgs)
            csv += "," + weekAvgs[dataPoint];
        
        csv += "\n";
    });
  
	fs.writeFile(outputFile, csv, function(err) {
    if(err)
        return console.log(err);
        console.log("The file was saved!");
	});
});