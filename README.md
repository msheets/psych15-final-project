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

`toCSV.js` in the `scraping` folder serves to aggregate and export the downloaded data to CSV format for use in excel. The resulting CSV contains both the individual songs from each week and the average data for each of those songs. Note that the appropriate `streaming-echonest.json` or `hot100-echonest.json` file must exist for the script to work properly.

To use the script on streaming-echonest.json run:

	node toCSV.js

To use the script on hot100-echonest.json run:

	node toCSV.js hot100

The results will show up in the appropriate files (`streaming-echonest.csv` & `hot100-echonest.csv` respectively) in the `data` folder of this repository.


Data
----

The `data` folder contains the pre-computed results of the procedures described in the Scraping section above.

Site
----

The `site` folder contains a the code used in the website found [here](http://www.hcs.harvard.edu/~msheets/psych15/) that was built for the purpose of quickly and easily exploring the data.


