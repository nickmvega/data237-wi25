// margin convention
const svgWidth = 600,
    svgHeight = 560,
    margin = { top: 30, right: 30, bottom: 60, left: 60 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

// svgs
let svgScatter = d3.select("#scatterplot-container").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let svgBarRoot = d3.select("#bar-container").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
    svgBar = svgBarRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    svgBarOverlay = svgBarRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let xScaleScatter,
    yScaleScatter,
    xScaleBar,
    yScaleBar;

d3.csv("cars.csv")
    .then(function (data) {
        console.log(data);

        // cast strings as numbers
        for (let i = 0; i < data.length; i++) {
            data[i].hp = +data[i].hp;
            data[i].mpg = +data[i].mpg;
        }

        // reformat data
        let barData = getBarData(data);
        
        // scatterplot:
        // create scales
        xScaleScatter = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.hp))
            .range([0, width]), 
        yScaleScatter = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.mpg))
            .range([height, 0]);

        // create our axes
        let xAxisScatter = svgScatter.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleScatter));
        let yAxisScatter = svgScatter.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScaleScatter));

        // label our axes
        xAxisScatter.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Horsepower")
        yAxisScatter.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Miles per gallon")

        // plot data
        svgScatter.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => xScaleScatter(d.hp))
            .attr("cy", (d) => yScaleScatter(d.mpg))
            .attr("r", 5)
            .attr("class", "non-brushed");



        // bar chart:
        // set up scales
        xScaleBar = d3.scaleBand()
            .domain(barData.map((d) => d.cyl))
            .range([0, width])
            .padding(0.1);
        yScaleBar = d3.scaleLinear()
            .domain([0, d3.max(barData, (d) => d.count)])
            .range([height, 0]);

        // axes
        let xAxisBar = svgBar.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScaleBar));
        let yAxisBar = svgBar.append("g")
            .call(d3.axisLeft(yScaleBar));

        // label our axes
        xAxisBar.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Cylinders")
        yAxisBar.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Number of records")

        // render bars
        svgBar.selectAll("rect")
            .data(barData)
            .join("rect")
            .attr("class", "non-brushed")
            .attr("x", (d) => xScaleBar(d.cyl))
            .attr("y", (d) => yScaleBar(d.count))
            .attr("width", xScaleBar.bandwidth())
            .attr("height", (d) => height - yScaleBar(d.count));

    })
    .catch(function (err) {
        console.error(err);
    });

// helper functions
// formats data for bar chart
function getBarData(data) {
    let returnData = [];

    data.forEach((obj) => {
        let uniqueCyl = returnData.reduce((prev, curr) => (prev && curr.cyl != obj.cyl), true);
        if (uniqueCyl) {
            returnData.push({
                "cyl": +obj.cyl,
                "count": 1
            });
        } else {
            let cylIdx = returnData.findIndex((elem) => elem.cyl == +obj.cyl);
            returnData[cylIdx].count++;
        }
    });
    returnData = returnData.sort((a, b) => a.cyl - b.cyl);
    // console.log(returnData);

    return returnData;
}