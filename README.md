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

The results will show up in the appropriate files in the `data` folder of this repository.
