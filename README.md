psych15-final-project
=====================

This repository contains the code written and used in the study performed by Matt Sheets for his final project in Psychology 15. The project entitled "Le Quattro Stagioni (The Four Seasons)" looked at the relationship between music preferences and seasonal change.

Scraping
--------

The code used in the scraping portion of the project relies on the [node.js](http://nodejs.org/), and, consequently, it will need to be installed in order to run the contained code. (See [tutorial](http://blog.modulus.io/absolute-beginners-guide-to-nodejs) for introduction to using node.js).

### Billboard ###

The first step in the project was to scrape [billboard.com](billboard.com) to collect the top songs for each week in question. The file `billboard.js` in the `scraping` file does just this. To scrape the top 10 songs for each week from Billboard's Streaming Songs chart going back up to 3 years or until the data runs out, run the following command:

	node billboard.js

To do the same but for Billboard's Hot 100 chart going back upto 50 years, run the following command:

	node billboard.js hot100

The results will show up in the appropriate files (`streaming-billboard.json` & `hot100-billboard.json` respectively) in the `data` folder of this repository.

### Echonest ###

The next step is to query the [Echo Nest API](http://echonest.com/) for metadata about the scraped songs. Note that in order for the code in this stage to work, one will need to first complete the Billboard stage above as the code here references the files created above. Second, in order to query the echonest database you must acquire an API key. The API key used is not included for security reasons, but a template file in which to place your API key is included. To register for an API key visit: [https://developer.echonest.com/account/register()](https://developer.echonest.com/account/register). It is recommended that you request for an upgraded account so as to improve your rate limits, which default to rather low values. Once you have an API key, insert it appropriately into `apiKey.template.json` in the `scraping` folder and rename the file to `apiKey.json`.

In order to get the Echo Nest data for streaming-billboard.json run:

	node echonest.js

To get the Echo Nest data for hot100-billboard.json run:

	node echonest.js hot100

The results will show up in the appropriate files (`streaming-echonest.json` & `hot100-echonest.json` respectively) in the `data` folder of this repository.

### Aggregating to CSV ###

`toCSV.js` in the `scraping` folder serves to aggregate and export the downloaded data to CSV format for use in excel. The resulting CSV contains the individual songs from each week. Note that the appropriate `streaming-echonest.json` or `hot100-echonest.json` file must exist for the script to work properly.

To use the script on streaming-echonest.json run:

	node toCSV.js

To use the script on hot100-echonest.json run:

	node toCSV.js hot100

The results will show up in the appropriate files (`streaming.csv` & `hot100.csv` respectively) in the `data` folder of this repository.

Additionally, `toCSVAverage.js` performs the same tasks but computes the average scores for each week with a uniform waiting (i.e. the song in position 6 on the chart has the same weighting as that in position 1).

To use the script on streaming-echonest.json run:

	node toCSVAverage.js

To use the script on hot100-echonest.json run:

	node toCSVAverage.js hot100

The results will show up in the appropriate files (`streaming-averages.csv` & `hot100-averages.csv` respectively) in the `data` folder of this repository.	

Data
----

The `data` folder contains the pre-computed results of the procedures described in the Scraping section above.

Site
----

The `site` folder contains a the code used in the website found [here](http://www.hcs.harvard.edu/~msheets/psych15/) that was built for the purpose of quickly and easily exploring the data.

The site was built using the data above and the [d3 library](http://d3js.org/).

The site allows you to manipulate several parameters in viewing the data. The first of these parameters is the data point being viewed. All data points have been pulled from the Echo Nest API and aggregated appropriately.

Additionally, the site allows for smoothing. When `none` is selected, the average values for each day of the year are shown. If `weeks` is selected, the data is averaged by week and if `months` is selected, the data is averaged by month.

The site allows you to select which dataset you are viewing (most streamed songs vs hot 100 songs).

Finally it allows you to select the time frame within this dataset that you would like to view. The time frame must be at least one year in length. If more than one year is selected (as in the default state), the values for each day are averaged together. That is to say the value shown on January 23rd, is the average of the values on January 23rd for each year selected.