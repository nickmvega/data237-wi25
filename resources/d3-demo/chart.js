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

let svgHistogramRoot = d3.select("#histogram-container").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight * 2);

let svgHistogramHP = svgHistogramRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    svgHistogramHPOverlay = svgHistogramRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    svgHistogramMPG = svgHistogramRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height + margin.bottom) + ")"),
    svgHistogramMPGOverlay = svgHistogramRoot.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height + margin.bottom) + ")");

let brush = d3.brush() 
    .on("start brush", brushFxn)
    .on("end", updateHistograms);

let scatterData = [],
    histogramHPData = [], 
    histogramMPGData = [],
    filteredHistogramHPData = [],
    filteredHistogramMPGData = [],
    points, 
    xScaleScatter,
    yScaleScatter,
    xScaleHistogramHP,
    xScaleHistogramMPG,
    yScaleHistogramHP,
    yScaleHistMPG;

d3.csv("cars.csv")
    .then(function (data) {
        console.log(data);

        // cast strings as numbers
        scatterData = deepCopy(data); 
        for (let i = 0; i < scatterData.length; i++) {
            scatterData[i].hp = +scatterData[i].hp;
            scatterData[i].mpg = +scatterData[i].mpg;
        }
        
        // scatterplot:
        // create scales
        xScaleScatter = d3.scaleLinear()
            .domain(d3.extent(scatterData, (d) => d.hp)) 
            .range([0, width]), 
        yScaleScatter = d3.scaleLinear()
            .domain(d3.extent(scatterData, (d) => d.mpg))
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
        points = svgScatter.selectAll("circle") 
            .data(scatterData) 
            .join("circle")
            .attr("cx", (d) => xScaleScatter(d.hp))
            .attr("cy", (d) => yScaleScatter(d.mpg))
            .attr("r", 5)
            .attr("class", "non-brushed");

        // brush
        svgScatter.append("g") 
            .call(brush);

        //histograms
        histogramHPData = getHistogramData(scatterData, 'hp', 13);
        histogramMPGData = getHistogramData(scatterData, 'mpg', 11);

        // histogram scales
        xScaleHistogramHP = d3.scaleLinear()
            .domain([45, d3.max(scatterData, d => d.hp)])
            .range([0, width]);
        xScaleHistogramMPG = d3.scaleLinear()
            .domain([8, d3.max(scatterData, d => d.mpg)])
            .range([0, width]);
        yScaleHistogramHP = d3.scaleLinear()
            .domain([0, d3.max(histogramHPData, d => d.length)])
            .range([height, 0]);
        yScaleHistogramMPG = d3.scaleLinear()
            .domain([0, d3.max(histogramMPGData, d => d.length)])
            .range([height, 0]);

        // histogram axes
        let xAxisHistogramHP = svgHistogramHP.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScaleHistogramHP));
        let yAxisHistogramHP = svgHistogramHP.append("g")
            .call(d3.axisLeft(yScaleHistogramHP));
        let xAxisHistogramMPG = svgHistogramMPG.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScaleHistogramMPG));
        let yAxisHistogramMPG = svgHistogramMPG.append("g")
            .call(d3.axisLeft(yScaleHistogramMPG));
        
        // label our histogram axes
        xAxisHistogramHP.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Horsepower")
        yAxisHistogramHP.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Frequency")
        xAxisHistogramMPG.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Miles per gallon")
        yAxisHistogramMPG.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${2 * height / 5}) rotate(-90)`)
            .text("Frequency")
        
        // render histograms
        svgHistogramHP.selectAll("rect")
            .data(histogramHPData)
            .join("rect")
            .attr("class", "non-brushed")
            .attr("x", d => xScaleHistogramHP(d.x0))
            .attr("y", d => yScaleHistogramHP(d.length))
            .attr("width", d =>  xScaleHistogramHP(d.x1) - xScaleHistogramHP(d.x0))
            .attr("height", d => height - yScaleHistogramHP(d.length));

        svgHistogramMPG.selectAll("rect")
            .data(histogramMPGData)
            .join("rect")
            .attr("class", "non-brushed")
            .attr("x", d => xScaleHistogramMPG(d.x0))
            .attr("y", d => yScaleHistogramMPG(d.length))
            .attr("width", d =>  xScaleHistogramMPG(d.x1) - xScaleHistogramMPG(d.x0))
            .attr("height", d => height - yScaleHistogramMPG(d.length));
    })
    .catch(function (err) {
        console.error(err);
    });

// helper functions
// formats data for bar chart
function deepCopy(inObject) { // inclass: add
    let outObject, value, key;
    if (typeof inObject !== "object" || inObject === null) {
        return inObject; // Return the value if inObject is not an object
    }
    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {};
    for (key in inObject) {
        value = inObject[key];
        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopy(value);
    }
    return outObject;
}

function brushFxn(event) { // inclass: add
    // console.log(event);

    // revert points to initial style
    points.attr("class", "non-brushed");

    let brushCoords;
    if (event.selection != null) {
        let brushCoordsD3 = d3.brushSelection(this);
        brushCoords = {
            "x0": brushCoordsD3[0][0],
            "x1": brushCoordsD3[1][0],
            "y0": brushCoordsD3[0][1],
            "y1": brushCoordsD3[1][1]
        }

        // style brushed points
        points.filter(brushFilter)
            .attr("class", "brushed");
        
        // filter histogram data
        let filteredScatterData = scatterData.filter(brushFilter);
        filteredHistogramHPData = getHistogramData(filteredScatterData, 'hp', 20);
        filteredHistogramMPGData = getHistogramData(filteredScatterData, 'mpg', 20);
        
        // render bars in real time
        updateHistograms();
    }

    function brushFilter(d) {
        // iterating over data bound to my points
        let cx = xScaleScatter(d.hp),
            cy = yScaleScatter(d.mpg);

        // get only points inside of brush
        return (brushCoords.x0 <= cx && brushCoords.x1 >= cx && brushCoords.y0 <= cy && brushCoords.y1 >= cy);
    }
}

function getHistogramData(data, value, bins) {
    let histogramData = d3.histogram()
        .value(d => d[value])
        .domain(d3.extent(data, d => d[value]))
        .thresholds(bins)(data);
    return histogramData;
}

function updateHistograms() {
    // foreground bars
    svgHistogramHPOverlay.selectAll("rect")
        .data(filteredHistogramHPData)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleHistogramHP(d.x0))
        .attr("y", d => yScaleHistogramHP(d.length))
        .attr("width", d => d3.max([0, xScaleHistogramHP(d.x1) - xScaleHistogramHP(d.x0) - 1]))
        .attr("height", d => height - yScaleHistogramHP(d.length));

    svgHistogramMPGOverlay.selectAll("rect")
        .data(filteredHistogramMPGData)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleHistogramMPG(d.x0))
        .attr("y", d => yScaleHistogramMPG(d.length))
        .attr("width", d => d3.max([0, xScaleHistogramMPG(d.x1) - xScaleHistogramMPG(d.x0) - 1]))
        .attr("height", d => height - yScaleHistogramMPG(d.length));
}