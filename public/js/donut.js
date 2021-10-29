let lasts = document.querySelectorAll('.lasts');

let table = document.getElementById("table");

let dataPie = [].reduce.call(table.rows, function (res, row) {
    res[row.cells[0].textContent.slice()] = row.cells[1].textContent;
    return res
}, {});

console.log(dataPie)


// Data
// set the dimensions and margins of the graph
const widthPie = 300
const heightPie = 300
const marginPie = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(widthPie, heightPie) / 2 - marginPie;

// append the svg object to the div called 'my_dataviz'
var svgPie = d3.select("#chart")
    .append("svg")
    .attr("width", widthPie)
    .attr("height", heightPie)
    .append("g")
    .attr("transform", "translate(" + widthPie / 2 + "," + heightPie / 2 + ")");

// Create dummy data

// set the color scale
var color = d3.scaleOrdinal()
    .domain(dataPie)
    .range(d3.schemeSet2);

// Compute the position of each group on the pie:
var pie = d3.pie()
    .value(function (d) {
        return d.value;
    })
var data_ready = pie(d3.entries(dataPie))
// Now I know that group A goes from 0 degrees to x degrees and so on.

// shape helper to build arcs:
var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svgPie
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function (d) {
        return (color(d.data.key))
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

// Now add the annotation. Use the centroid method to get the best coordinates
svgPie
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function (d) {
        return d.data.key
    })
    .attr("transform", function (d) {
        return "translate(" + arcGenerator.centroid(d) + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", 17)
