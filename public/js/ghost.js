const width = 960;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 100;

// VARIABLE COLOR
// const color = d3.scaleOrdinal().range(d3.schemeCategory10);

const svg = d3.select("div#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj * 3) + " "
        + (height + adj * 3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

// DATA
const timeConv = d3.timeParse("%d-%b-%Y");
const dataset = d3.csv("../data/2020_birds.csv");  // Getting data
dataset.then(function (data) {
    var slices = data.columns.slice(1).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    });

// SCALES
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().rangeRound([height, 0]);
    xScale.domain(d3.extent(data, function (d) {
        return timeConv(d.date)
    }));

    yScale.domain([(0), d3.max(slices, function (c) {
        return d3.max(c.values, function (d) {
            return d.measurement + 4;
        });
    })
    ]);

// AXES
    const yaxis = d3.axisLeft().scale(yScale);

    const xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat('%m %y'))
        .scale(xScale);

// LINES
    const line = d3.line()
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d.measurement);
        });

// AXES
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);

    svg.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Frequency");

// LINES
    const lines = svg.selectAll("lines")
        .data(slices)
        .enter()
        .append("g");

    lines.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        });

    lines.append("text")
        .attr("class", "serie_label")
        .datum(function (d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .text(function (d) {
            return d.id;
        });

    const ghost_lines = lines.append("path")
        .attr("class", "ghost-line")
        .attr("d", function (d) {
            return line(d.values);
        });

// EVENTS
    svg.selectAll(".ghost-line")
        .on('mouseover', function () {
            const selection = d3.select(this).raise();

            selection
                .transition()
                .delay("100").duration("10")
                .style("stroke", "blue")
                .style("opacity", "1")
                .style("stroke-width", "3");

            // add the legend action
            const legend = d3.select(this.parentNode)
                .select(".serie_label");

            legend
                .transition()
                .delay("100")
                .duration("10")
                .style("fill", "blue");
        })

        .on('mouseout', function () {
            const selection = d3.select(this)

            selection
                .transition()
                .delay("100")
                .duration("10")
                .style("stroke", "#d2d2d2")
                .style("opacity", "0")
                .style("stroke-width", "10");

            // add the legend action
            const legend = d3.select(this.parentNode)
                .select(".serie_label");

            legend
                .transition()
                .delay("100")
                .duration("10")
                .style("fill", "#d2d2d2");
        });
});