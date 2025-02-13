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

let svgHistogramHP = d3.select("#histogram-hp-container").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log("HP histogram container:", document.getElementById("histogram-hp-container"));
console.log("HP SVG created:", svgHistogramHP.node());

let svgHistogramMPG = d3.select("#histogram-mpg-container").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log("MPG histogram container:", document.getElementById("histogram-mpg-container"));
console.log("MPG SVG created:", svgHistogramMPG.node());

let brush = d3.brush() 
    .on("start brush", brushFxn)
    .on("end", brushFxn);

let histogramHPData = [],
    histogramMPGData = [],
    filteredHistogramHPData = [],
    filteredHistogramMPGData = [],
    xScaleHistHP,
    xScaleHistMPG;

let scatterData = [], 
    points, 
    xScaleScatter,
    yScaleScatter,
    xScaleBar,
    yScaleBar;

function getHistogramData(data, key, bins) {
    const histogram = d3.histogram()
        .value(d => d[key])
        .domain(d3.extent(data, d => d[key]))
        .thresholds(bins);
    
    return histogram(data);
}

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
        histogramHPData = getHistogramData(data, 'hp', 20);
        histogramMPGData = getHistogramData(data, 'mpg', 20);

        xScaleHistHP = d3.scaleLinear()
            .domain([d3.min(histogramHPData, d => d.x0), d3.max(histogramHPData, d => d.x1)])
            .range([0, width]);
            
        let yScaleHistHP = d3.scaleLinear()
            .domain([0, d3.max(histogramHPData, d => d.length)])
            .range([height, 0]);

        xScaleHistMPG = d3.scaleLinear()
            .domain([d3.min(histogramMPGData, d => d.x0), d3.max(histogramMPGData, d => d.x1)])
            .range([0, width]);
            
        let yScaleHistMPG = d3.scaleLinear()
            .domain([0, d3.max(histogramMPGData, d => d.length)])
            .range([height, 0]);

        // Axes HP 
        let xAxisHistHP = svgHistogramHP.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleHistHP));
            
        let yAxisHistHP = svgHistogramHP.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScaleHistHP));

        // Axes MPG
        let xAxisHistMPG = svgHistogramMPG.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleHistMPG));
            
        let yAxisHistMPG = svgHistogramMPG.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScaleHistMPG));

        // Labels
        xAxisHistHP.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Horsepower");
            
        yAxisHistHP.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${height/2}) rotate(-90)`)
            .text("Frequency");

        xAxisHistMPG.append("text")
            .attr("class", "label")
            .attr("transform", `translate(${width / 2}, 40)`)
            .text("Miles per Gallon");
            
        yAxisHistMPG.append("text")
            .attr("class", "label")
            .attr("transform", `translate(-40, ${height/2}) rotate(-90)`)
            .text("Frequency");

        // Draw HP histogram bars
        svgHistogramHP.selectAll("rect")
            .data(histogramHPData)
            .join("rect")
            .attr("class", "non-brushed")
            .attr("x", d => xScaleHistHP(d.x0))
            .attr("y", d => yScaleHistHP(d.length))
            .attr("width", d => xScaleHistHP(d.x1) - xScaleHistHP(d.x0))
            .attr("height", d => height - yScaleHistHP(d.length));

        // Draw MPG histogram bars
        svgHistogramMPG.selectAll("rect")
            .data(histogramMPGData)
            .join("rect")
            .attr("class", "non-brushed")
            .attr("x", d => xScaleHistMPG(d.x0))
            .attr("y", d => yScaleHistMPG(d.length))
            .attr("width", d => xScaleHistMPG(d.x1) - xScaleHistMPG(d.x0))
            .attr("height", d => height - yScaleHistMPG(d.length));

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
        
        // filter bar data
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

function updateHistograms() {
    // Update HP histogram
    let yScaleHistHP = d3.scaleLinear()
        .domain([0, d3.max(filteredHistogramHPData, d => d.length)])
        .range([height, 0]);

    svgHistogramHP.selectAll("rect.brushed")
        .data(filteredHistogramHPData)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleHistHP(d.x0))
        .attr("y", d => yScaleHistHP(d.length))
        .attr("width", d => xScaleHistHP(d.x1) - xScaleHistHP(d.x0))
        .attr("height", d => height - yScaleHistHP(d.length));

    // Update MPG histogram
    let yScaleHistMPG = d3.scaleLinear()
        .domain([0, d3.max(filteredHistogramMPGData, d => d.length)])
        .range([height, 0]);

    svgHistogramMPG.selectAll("rect.brushed")
        .data(filteredHistogramMPGData)
        .join("rect")
        .attr("class", "brushed")
        .attr("x", d => xScaleHistMPG(d.x0))
        .attr("y", d => yScaleHistMPG(d.length))
        .attr("width", d => xScaleHistMPG(d.x1) - xScaleHistMPG(d.x0))
        .attr("height", d => height - yScaleHistMPG(d.length));
}