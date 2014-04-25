var year = 2014;

var margin = {top: 20, bottom: 100, left: 80, right: 50};
var width = 760 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var detailMargin = {top: 20, bottom: 100, left: 20, right: 20};
var detailWidth = 240 - margin.left - margin.right;
var detailHeight = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%B %-d, %Y").parse;
var parseDay = function(day) { var date = d3.time.format("%-m/%-d").parse(day); date.setFullYear(year); return date; }
var parseWeek = d3.time.format("%-j").parse;
var dataPointAccessor = function(d) { return d.echonest.audio_summary.valence; };
var dataSmoothingAccessor = function(d) { return d.dates; }
var data = [];
var dataAccessor = function(date) {
    var sum = 0,
        n = 0;

    var extent = brush.extent();
    date.values.map(function(year) {
        if (year.date >= extent[0] && year.date <= extent[1]) {
            year.listings.map(function(listing) {
                sum += dataPointAccessor(listing);
                ++n;
            });
        }
    });

    if (n <= 0)
        return null;     
    else (n > 0)
        return sum / n;
} 
var definedAccessor = function(date) {
    var n = 0;

    var extent = brush.extent();
    date.values.map(function(year) {
        if (year.date >= extent[0] && year.date <= extent[1])
            n += year.listings.length;
    });

    return n > 0;
}

var xScale = d3.time.scale()
    .range([0, width]);

var yScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickFormat(d3.time.format("%B"));

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var sliderMargin = {top: 11, right: 40, bottom: 60, left: 0},
    sliderWidth = 700 - sliderMargin.left - sliderMargin.right,
    sliderHeight = 100 - sliderMargin.top - sliderMargin.bottom;

var xScaleSlider = d3.time.scale()
    .range([0, sliderWidth]);

var xAxisSlider = d3.svg.axis()
    .scale(xScaleSlider)
    .orient("bottom");


var brush = d3.svg.brush().x(xScaleSlider);

var line = d3.svg.line()
  //  .interpolate("basis")
    .x(function(d) { return xScale(parseDay(d.key)); })
    .y(function(d) { return yScale(dataAccessor(d)); })
    .defined(dataAccessor);

var svg = d3.select("#viz").append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");

var detailSvg = d3.select("#detail-viz").append("svg")
    .attr("width", detailWidth+detailMargin.left+detailMargin.right)
    .attr("height", detailHeight+detailMargin.top+detailMargin.bottom);

var detailG = detailSvg.append("g")
    .attr("transform", "translate("+detailMargin.left+","+detailMargin.top+")");

d3.json("data/hot100-echonest.json", function(dataHot100) {
    d3.json("data/streaming-echonest.json", function(dataStreaming) {

        var processData = function(data) {
            var dataObject = {};

            // Group data by date -> year -> top songs
            // Add unseen days
            var denseData = [];
            data.map(function(d) {
                var filteredListings = d.listings.filter(function(listing) {
                    return listing.echonest;
                });
                if (d.date && d.listings.length > 0) {
                    for (var i = 0; i < 7; ++i) {
                        var day = parseDate(d.date);
                        day.setDate(day.getDate() + i);
                        denseData.push({
                            date: day,
                            listings: filteredListings
                        });
                    }
                }
            });

            // create dates
            dataObject.dates = d3.nest()
                .key(function(d) { return (d.date.getMonth() + 1) + "/" + (d.date.getDate()) }) // avoid assigning year
                /*.rollup(function(d) {
                    d.forEach(function(year) {
                        year.year = year.date.getFullYear();
                    });
                    return d;
                })*/
                .entries(denseData);

            // Sort Dates
            dataObject.dates.sort(function(a, b) {
                a = parseDay(a.key);
                b = parseDay(b.key);
                if (a < b) return -1;
                else if (a > b) return 1;
                else return 0;
            });

            // create weeks - not real weeks
            dataObject.weeks = d3.nest()
                .key(function(d) { 
                    // http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
                    var startDate = (new Date(d.date.getTime())).setFullYear(year);
                    var diff = startDate - parseDay("1/1"); // changing year! TODO: fix
                    var oneDay = 1000 * 60 * 60 * 24;
                    var day = Math.floor(diff / oneDay);
                    var week = Math.floor(day / 7);
                    var midWeek = week * 7 + 3
                    var weekDate = parseWeek("" + midWeek);
                    return (weekDate.getMonth() + 1) + "/" + (weekDate.getDate());
                })
                .entries(denseData);

            // Sort Weeks
            dataObject.weeks.sort(function(a, b) {
                a = parseDay(a.key);
                b = parseDay(b.key);
                if (a < b) return -1;
                else if (a > b) return 1;
                else return 0;
            });

            // create months
            dataObject.months = d3.nest()
                .key(function(d) { 
                    // http://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery
                    var startDate = (new Date(d.date.getTime())).setFullYear(year);
                    var firstDay = new Date(year, d.date.getMonth(), 1);
                    var lastDay = new Date(year, d.date.getMonth() + 1, 0);
                    var middleDay = new Date((firstDay.getTime() + lastDay.getTime()) / 2);
                    return (middleDay.getMonth() + 1) + "/" + (middleDay.getDate());
                })
                .entries(denseData);

            // Sort months
            dataObject.months.sort(function(a, b) {
                a = parseDay(a.key);
                b = parseDay(b.key);
                if (a < b) return -1;
                else if (a > b) return 1;
                else return 0;
            });

            // create seasons
            var summer = [5, 6, 7, 8, 9, 10];
            var winter = [1, 2, 3, 4, 11, 12];

            dataObject.seasons = d3.nest()
                .key(function(d) { 
                    var month = d.date.getMonth() + 1;
                    if (summer.indexOf(month) != -1)
                        return "summer";
                    else
                        return "winter";
                })
                .entries(denseData);

            // Sort months
            dataObject.seasons.sort();
            return dataObject;
        }

        var streaming = processData(dataStreaming),
            hot100 = processData(dataHot100);

        data = streaming;
        
        xScaleSlider.domain([
            d3.min(dataSmoothingAccessor(data), function(date) {
                return d3.min(date.values, function(year) {
                    return year.date
                });
            }),
            d3.max(dataSmoothingAccessor(data), function(date) {
                return d3.max(date.values, function(year) {
                    return year.date;
                });
            })
        ]);
        brush.on("brushend", brushed).extent(xScaleSlider.domain());
        var sliderSvg = d3.select("#time-interval-selector").append("svg")
                .attr("width", sliderWidth+sliderMargin.left+sliderMargin.right)
                .attr("height", sliderHeight+sliderMargin.top+sliderMargin.bottom)
            .append("g")
                .attr("transform", "translate(" + sliderMargin.left + "," + sliderMargin.top + ")");

        sliderSvg.append("rect")
            .attr("class", "grid-background")
            .attr("width", sliderWidth)
            .attr("height", sliderHeight);

            
        var sliderGrid = sliderSvg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + sliderHeight + ")")
            .call(d3.svg.axis()
                .scale(xScaleSlider)
                .orient("bottom")
                .tickSize(-sliderHeight)
                .tickFormat(""));

        var sliderLabels = sliderSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + sliderHeight + ")")
            .call(xAxisSlider);

        sliderLabels.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
            });

        var gBrush = sliderSvg.append("g")
            .attr("class", "brush")
            .call(brush);

        gBrush.selectAll("rect")
            .attr("height", sliderHeight);

        function brushed() {
            if (!d3.event.sourceEvent) return; // only transition after input

            var extent = brush.extent();
            var diff = extent[1].getTime() - extent[0].getTime();
            var oneYear = 1000 * 60 * 60 * 24 * (365 + 2 * 7); // technically one year plus  week to deal with buffer problems
            if (diff / oneYear < 1) {
                var needed = oneYear - diff,
                    splitNeeded = needed / 2;

                var domain = xScaleSlider.domain();
                var newExtent = [0,0];
                // domain is at least one year
                if ((extent[0].getTime() - domain[0].getTime() > needed / 2) && (domain[1].getTime() - extent[1].getTime() > needed / 2)) {
                    newExtent[0] = extent[0].getTime() - needed / 2;
                    newExtent[1] = extent[1].getTime() + needed / 2;
                }
                else if (extent[0].getTime() - domain[0].getTime() > needed / 2) {
                    console.log(domain[1]);
                    newExtent[1] = domain[1].getTime();
                    var remaining = needed - (domain[1].getTime() - extent[1].getTime());
                    newExtent[0] = extent[0].getTime() - remaining;
                }
                else {
                    newExtent[0] = domain[0].getTime();
                    var remaining = needed - (extent[0].getTime() - domain[0].getTime());
                    newExtent[1] = extent[1].getTime() + remaining;
                }
                newExtent[0] = new Date(newExtent[0]);
                newExtent[1] = new Date(newExtent[1]);


                d3.select(this).transition().duration(200)
                    .call(brush.extent(newExtent))
                    .call(brush.event);

            }

            lineVis
                .transition()
                .duration(500)
                .attr("d", line);

            bars
                .transition()
                .duration(500)
                .attr("y", function(d) { return yScale(dataAccessor(d)); })
                .attr("height", function(d) { return detailHeight - yScale(dataAccessor(d)); });
        }        

        /*
        // calculate correlation
        var seasonsList = [],
            summaryList = [];
        dates.map(function(date) {
            var val = dataAccessor(date);
            var date = parseDay(date.key);
            var month = date.getMonth() + 1;

            if (summer.indexOf(month) != -1) var season = 1;
            else var season = 0;
            seasonsList.push(season);
            summaryList.push(val);
        });

        console.log(getPearsonCorrelation(seasonsList, summaryList));*/

        xScale.domain([parseDay("1/1"), parseDay("12/31")]);
        yScale.domain([
            d3.min(data.dates, function(date) {
                return d3.min(date.values, function(year) {
                    return d3.min(year.listings, function(song) {
                        return dataPointAccessor(song);
                    });
                });
            }),
            d3.max(data.dates, function(date) {
                return d3.max(date.values, function(year) {
                    return d3.max(year.listings, function(song) {
                        return dataPointAccessor(song);
                    });
                });
            })
        ]);

        var xAxisVis = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        xAxisVis.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
            });

        var yAxisVis = g.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var yLabel = yAxisVis.append("text")
            .attr("class", "y label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .style("text-anchor", "middle")
            .text("valence");

        var lineVis = g.append("path")
            .datum(data.dates)
            .attr("class", "line")
            .attr("d", line);

        detailG.append("text")
            .attr("class", "detail-title")
            .attr("text-align", "center")
            .text("seasonal averages")
            .attr("x", -12);

        var barOffset = 8;
        var barWidth = detailWidth / 2 - barOffset;
        var barGroups = detailG.selectAll(".bar-group")
                .data(data.seasons)
            .enter().append("g")
                .attr("class", "bar-group")
                .attr("transform", function(d, i) { return "translate(" + (i * (barWidth + barOffset)) + ",0)"; });

        var bars = barGroups.append("rect")
            .attr("x", 0)
            .attr("width", barWidth)
            .attr("y", function(d) { return yScale(dataAccessor(d)); })
            .attr("height", function(d) { return detailHeight - yScale(dataAccessor(d)); });

        var labels = barGroups.append("text")
            .attr("class", "bar-label")
            .text(function(d) { return d.key; })
            .style("text-anchor", "end")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(" + (barWidth / 2 + 6) + "," + (detailHeight + 14) + ") rotate(-65)");


        /*var dataPointsContainer = g.append("g")
            .attr("class", "data-points-container");

        var dataPoints = dataPointsContainer.selectAll(".data-points")
                .data(data)
            .enter().append("circle")
                .attr("class", "data-point")
                .attr("cx", );*/

        // add view options
        var controls = d3.select("#controls");
        var params = ["acousticness", "danceability", "duration", "energy", "loudness", "tempo", "valence"];
        for (var i = 0; i < params.length; ++i) {
            var param = params[i];
            if (param != "date") {                    
                var dataPointControls = controls.select("#data-point-selector");

                var container = dataPointControls.append("li")
                    .attr("class", "data-point-container " + param);

                var input = container.append("a")
                    .text(param)
                    .attr("href", "#")
                    .on("click", (function(param) { return function() {
                        d3.event.preventDefault();

                        dataPointControls.selectAll(".data-point-container a").classed("selected", false);
                        dataPointControls.select(".data-point-container." + param + " a").classed("selected", true);

                        dataPointAccessor = function(d) { return d.echonest.audio_summary[param]; }
                        yScale.domain([
                            d3.min(data.dates, function(date) {
                                return d3.min(date.values, function(year) {
                                    return d3.min(year.listings, function(song) {
                                        return dataPointAccessor(song);
                                    });
                                });
                            }),
                            d3.max(data.dates, function(date) {
                                return d3.max(date.values, function(year) {
                                    return d3.max(year.listings, function(song) {
                                        return dataPointAccessor(song);
                                    });
                                });
                            })
                        ]);

                        lineVis
                            .transition()
                            .duration(500)
                            .attr("d", line);

                        bars
                            .transition()
                            .duration(500)
                            .attr("y", function(d) { return yScale(dataAccessor(d)); })
                            .attr("height", function(d) { return detailHeight - yScale(dataAccessor(d)); });

                        yAxisVis.call(yAxis);
                        yLabel.text(param);
                    };})(param));

                if (param == "valence")
                    input.classed("selected", true);
            }
        }

        controls.selectAll(".smoothing-container a")
            .on("click", function() {
                d3.event.preventDefault();

                var val = d3.select(this).attr("data-val");

                controls.selectAll(".smoothing-container a").classed("selected", false);
                controls.select(".smoothing-container a[data-val=" + val + "]").classed("selected", true);

                switch (val) {
                    case "none":
                        dataSmoothingAccessor = function(d) { return d.dates; }
                        lineVis.datum(dataSmoothingAccessor(data))
                            .attr("d", line);                        
                        break;
                    case "week":
                        dataSmoothingAccessor = function(d) { return d.weeks; }
                        lineVis.datum(dataSmoothingAccessor(data))
                            .attr("d", line);
                        break;
                    case "month":
                        dataSmoothingAccessor = function(d) { return d.months; }
                        lineVis.datum(dataSmoothingAccessor(data))
                            .attr("d", line);                        
                        break;
                }
            });

        controls.selectAll(".data-shown-container a")
            .on("click", function() {
                d3.event.preventDefault();

                var val = d3.select(this).attr("data-val");

                controls.selectAll(".data-shown-container a").classed("selected", false);
                controls.select(".data-shown-container a[data-val=" + val + "]").classed("selected", true);
                
                switch (val) {
                    case "averages":
                        break;
                    case "data-points":
                        break;
                    case "both":
                        break;
                }
            });
        
        controls.selectAll(".data-set-container a")
            .on("click", function() {
                d3.event.preventDefault();

                var val = d3.select(this).attr("data-val");

                controls.selectAll(".data-set-container a").classed("selected", false);
                controls.select(".data-set-container a[data-val=" + val + "]").classed("selected", true);
                
                switch (val) {
                    case "streaming":
                        data = streaming;
                        break;
                    case "hot100":
                        data = hot100;
                        break;
                }

                xScaleSlider.domain([
                    d3.min(dataSmoothingAccessor(data), function(date) {
                        return d3.min(date.values, function(year) {
                            return year.date
                        });
                    }),
                    d3.max(dataSmoothingAccessor(data), function(date) {
                        return d3.max(date.values, function(year) {
                            return year.date;
                        });
                    })
                ]);

                xAxisSlider.scale(xScaleSlider);
                brush.extent(xScaleSlider.domain());
                gBrush.transition().duration(500).call(brush);


                sliderGrid.call(d3.svg.axis()
                    .scale(xScaleSlider)
                    .orient("bottom")
                    .tickSize(-sliderHeight)
                    .tickFormat(""));

                sliderLabels.call(xAxisSlider);  
                sliderLabels.selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)" 
                    });
                       

                yScale.domain([
                    d3.min(dataSmoothingAccessor(data), function(date) {
                        return d3.min(date.values, function(year) {
                            return d3.min(year.listings, function(song) {
                                return dataPointAccessor(song);
                            });
                        });
                    }),
                    d3.max(dataSmoothingAccessor(data), function(date) {
                        return d3.max(date.values, function(year) {
                            return d3.max(year.listings, function(song) {
                                return dataPointAccessor(song);
                            });
                        });
                    })
                ]);

                lineVis
                    .datum(dataSmoothingAccessor(data)) // need to get appropriate
                    .transition()
                    .duration(500)
                    .attr("d", line);

                bars.data(data.seasons)
                    .transition()
                    .duration(500)
                    .attr("y", function(d) { return yScale(dataAccessor(d)); })
                    .attr("height", function(d) { return detailHeight - yScale(dataAccessor(d)); });

            });
    });

});

/*
 *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
 */
function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;
     
    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }
  
    var xy = [];
    var x2 = [];
    var y2 = [];
  
    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }
  
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;
  
    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
  
    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;
  
    return answer;
}