
(function(pageHeight) {
    // ... all vars and functions are in this scope only
    // still maintains access to all globals
    var pageID = "#word-chart";

    var dataTotal = [];
    var data = [];
    var svgContainer = null;
    var tooltip = null;
    var checkClicked = null;
    // labels
    var labels = ["al-Shabaab", "Terrorists", "Gunmen", "Thugs", "Militants", "Criminals", "Gangsters", "Robbers", "Jihadists", "Murderers", "Extremists", "Islamists", "Enemies"];
    // colors				
    var colors = ["#DB3D3D", "#FCA43A", "#008DAA", "#91399E", "#9467bd", "#8c564b", "#e377c2", "#ff7f0e", "#98df8a", "#b34228", "#ff9896", "#17becf", "#c5b0d5"];
    var sData = null;


    // load everything from json
    function loadData() {
        d3.json("data/wordsDay.json", function(error, json) {
            if (error)
                return console.warn(error);
            data = json;

            d3.json("data/wordsDayTotal.json", function(error, json) {
                if (error)
                    return console.warn(error);
                dataTotal = json;
                visualizeitTotal();
            });
        });


    }



    function visualizeitTotal() {

        // bring date to the correct format
        var parseDate = d3.time.format("%Y-%m-%d").parse;
        dataTotal.forEach(function(d) {
            d.date = parseDate(d.date);
        });


        checkClicked = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
        /*data.forEach(function(d) {
         checkClicked.push(1);
         });*/

        // transform data to percentage
        var y_maxa = [];
        data.forEach(function(b, j) {
            if (checkClicked[j] !== 0) {
                y_maxa.push(d3.max(b.occurs, function(d, i) {
                    return d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                }));
            }
        });


        padding = 50;
        axisPadding = 40;
        axisPaddingX = 45;
        monthsPadding = 27;

        margin = {top: 10, right: 10, bottom: 10, left: 10};
        w = 900 - margin.left - margin.right;
        h = 500 - margin.top - margin.bottom;

        // scalling
        var xScale = d3.time.scale().range([padding, w - padding]);
        xScale.domain(d3.extent(dataTotal, function(d) {
            return d.date;
        }));

        var yScale = d3.scale.linear()
                .range([h - padding, padding]);
        yScale.domain([0, d3.max(y_maxa, function(d) {
                return d;
            })]);

        // Axis
        var xAxis = d3.svg.axis().scale(xScale)
                .orient("bottom").ticks(4);

        var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .tickFormat(d3.format(".0%"))
                .ticks(4);


        line = d3.svg.line();

        // svg container for linechart
        var container = d3.select("#word-chart .container");
        svgContainer = container.append("svg")
                .attr("width", w)
                .attr("height", h)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // svg container for legend
        var wlegend = 250;
        var hlegend = 350;


        legendsvg = container.append("svg")
                .attr("width", wlegend)
                .attr("height", 420);

        // setting the grid for y axis
        var gridy = svgContainer.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + axisPadding + ",0)")
                .call(make_y_axis(yScale)
                .tickSize(-w, 0, 0)
                .tickFormat("")
                );

        // create the vertical lines
        dataTotal.forEach(function(b, j) {

            svgContainer.selectAll("rect.lines")
                    .data(dataTotal)
                    .enter()
                    .append("rect")
                    .attr("x", xScale(b.date) - 1)
                    .attr("y", padding)
                    .attr("width", 2)
                    .attr("height", h - padding - 50)
                    .attr("class", "lala")
                    .style("opacity", 0)
                    .attr("id", "verlines-" + j);
        });


        // line "holder" for the mouse over event
        svgContainer.selectAll("rect.linesholders")
                .data(dataTotal)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {
            return xScale(dataTotal[i].date) - 80;
        })
                .attr("y", padding)
                .attr("width", 160)
                .attr("height", h - padding - 50)
                .attr("class", "linesholders")
                .style("fill", "#000")
                .style("opacity", 0)
                .on("mouseover", function(d, i) {

            svgContainer.select("#verlines-" + i).transition()
                    .duration(100)
                    .style("opacity", .4)
                    .style("visibility", "visible");

            tooltip.transition()
                    .duration(100)
                    .style("opacity", .9);

            tooltip.html(buildTooltipData(d, i))
                    .style("visibility", "visible");
        })


                .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })

                .on("mouseout", function(d, i) {
            svgContainer.select("#verlines-" + i).transition()
                    .duration(120)
                    .style("opacity", 0);

            tooltip.transition()
                    .duration(120)
                    .style("opacity", 0);
        });




        // build lines, dots, and legend
        data.forEach(function(b, j) {

            // legend rectangles 
            legendsvg.append("rect")
                    .attr("x", 40)
                    .attr("y", j * (hlegend / data.length) + 5)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("id", "rect-" + j)
                    .style("fill", "#fff")
                    .style("stroke", colors[j])
                    .attr("rx", 2)
                    .attr("ry", 2)
                    .style("stroke-width", 2)
                    .on("click", function() {
                onclickfunc(j, xAxis, yAxis, xScale, yScale, gridy);
            });

            // legend labels
            legendsvg.append("text")
                    .attr("x", 60)
                    .attr("y", j * (hlegend / data.length) + 10)
                    .attr("dy", ".35em")
                    .text(labels[j])
                    .on("mouseover", function() {
                hideLinesFunc(j);
            })
                    .on("mouseout", function() {
                showLinesFunc(j);
            });

            // if on checkClicked list then take occurances of of word
            if (checkClicked[j] !== 0) {
                // take occurances of each word for all days
                sData = b.occurs;

                // lines
                line
                        .x(function(d, i) {
                    return xScale(dataTotal[i].date);
                })
                        .y(function(d, i) {
                    d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                    return yScale(d);
                });

                svgContainer.append("path")
                        .attr("class", "grammes")
                        .attr("d", line(sData))
                        .attr("id", "lines-" + j)
                        .style("stroke", colors[j]);

                // circles to the lines	
                circles = svgContainer.selectAll("dot")
                        .data(sData)
                        .enter()
                        .append("circle")
                        .attr("r", 3)
                        .attr("cx", function(d, i) {
                    return xScale(dataTotal[i].date);
                })
                        .attr("cy", function(d, i) {
                    d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                    return yScale(d);
                })
                        .attr("id", "circles-" + j)
                        .style("fill", "#000")
                        .style("fill", colors[j]);


                legendsvg.select("#rect-" + j).style("fill", colors[j]);
            }

        });

        // tooltip div
        tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("height", "auto")
                .style("opacity", 0)
                .attr("z-index", 1000);
        // axis
        axiss = svgContainer.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + axisPadding + ",0)")
                .call(yAxis);


        axissX = svgContainer.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (h - axisPaddingX) + ")")
                .call(xAxis);

        // text label for x axis
        svgContainer.append("text")
                .attr("transform", "translate(" + (w / 2) + " ," + (h - margin.bottom) + ")")
                .style("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#8A93A5")
                .text("Date");

        // text label for y axis				
        svgContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", (0 - margin.left))
                .attr("x", 0 - (h / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#8A93A5")
                .text("Frequency");


    }


    // hide lines and dots on mouseover	
    function hideLinesFunc(pos) {
        data.forEach(function(b, j) {
            if ((pos !== j) && (checkClicked[pos] !== 0)) {
                svgContainer.select("#lines-" + j)
                        .transition()
                        .duration(250)
                        .style("opacity", .1);

                svgContainer.selectAll("#circles-" + j)
                        .transition()
                        .duration(250)
                        .style("opacity", .1);

            }
        });
    }


    // show lines and dots on mouseout	
    function showLinesFunc(pos) {
        data.forEach(function(b, j) {
            if (pos !== j) {
                svgContainer.select("#lines-" + j)
                        .transition()
                        .duration(250)
                        .style("opacity", 1);

                svgContainer.selectAll("#circles-" + j)
                        .transition()
                        .duration(250)
                        .style("opacity", 1);

            }
        });
    }
    ;

    // build tooltip
    function buildTooltipData(d, i) {

        // take a list of all words and their occurances for day i
        var dayView = [];
        data.forEach(function(b, j) {
            if (checkClicked[j] !== 0)
                dayView.push([colors[j], labels[j], b.occurs[i]]);
        });

        // sort the list
        var sortedDayView = dayView.sort(function(a, b) {
            return b[2] - a[2];
        });

        // build the html code
        var head = "<table ><tr><td class='tableHead' colspan='3'><b>Day " + (i + 1) + ".</b> Total: " + d.occurs + "</td></tr>";
        var rest = "";
        sortedDayView.forEach(function(b, j) {
            rest = rest + "<tr><td> <FONT size='4' COLOR='" + b[0] + "'><b>- </b></FONT>" + b[1] + "</td><td>" + b[2] + "</td></tr>";
        });

        return head + rest + "</table>";

    }

    /*	
     function make_x_axis() {		
     return d3.svg.axis()
     .scale(xScale)
     .orient("bottom")
     .ticks(5)
     }
     */

    // make grid for y axis
    function make_y_axis(yScale) {
        return d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(4);
    }

    // legend-rechtangles on click 	
    function onclickfunc(pos, xAxis, yAxis, xScale, yScale, gridy) {

        // remove or add the word in this pos to the list
        if (checkClicked[pos] === 0) {
            checkClicked[pos] = 1;

            // rebuild the line
            svgContainer.append("path")
                    .attr("class", "grammes")
                    .attr("d", line(sData))
                    .attr("id", "lines-" + pos)
                    .style("stroke", colors[pos]);

            // rebuild circles
            svgContainer.selectAll("dot")
                    .data(sData)
                    .enter()
                    .append("circle")
                    .attr("r", 3)
                    .attr("cx", function(d, i) {
                return xScale(dataTotal[i].date);
            })
                    .attr("cy", function(d, i) {
                d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                return yScale(d);
            })
                    .attr("id", "circles-" + pos)
                    .style("fill", colors[pos]);

            // rebuild rect
            legendsvg.select("#rect-" + pos).style("fill", colors[pos]);
        }
        else {
            checkClicked[pos] = 0;
            // remove line
            svgContainer.select("#lines-" + pos).remove();
            // remove circles
            svgContainer.selectAll("#circles-" + pos).remove();
            // remove rect
            legendsvg.select("#rect-" + pos).style("fill", "#fff");
        }

        // re-calculate max value for y axis
        var y_max = [];
        data.forEach(function(b, j) {
            if (checkClicked[j] !== 0) {
                y_max.push(d3.max(b.occurs, function(d, i) {
                    return d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                }));
            }
        });

        // update scale for y axis
        yScale.domain([0, d3.max(y_max, function(d) {
                return d;
            })]);

        yAxis.scale(yScale);

        axiss.transition()
                .duration(750)
                .call(yAxis);

        // update y grid
        gridy.transition()
                .duration(750)
                .call(make_y_axis(yScale)
                .tickSize(-w, 0, 0)
                .tickFormat(""));

        // update lines 
        data.forEach(function(b, j) {

            // if still on checkClicked list then take occurances of of word
            if (checkClicked[j] !== 0) {
                sData = b.occurs;

                // transition for lines and circles
                svgContainer.select("#lines-" + j)
                        .transition()
                        .duration(750)
                        .attr("d", line(sData))
                        .style("stroke", colors[j]);


                svgContainer.selectAll("#circles-" + j)
                        .data(sData)
                        .transition()
                        .duration(750)
                        .attr("r", 3)
                        .attr("cx", function(d, i) {
                    return xScale(dataTotal[i].date);
                })
                        .attr("cy", function(d, i) {
                    d = Math.round((d * 100 / dataTotal[i].occurs) * 10) / 1000;
                    return yScale(d);
                })
                        .style("fill", colors[j]);


            }

        });
    }






    loadData();

}(pageHeight));