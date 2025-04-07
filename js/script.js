// your script.js
const margin = { top: 40, right: 40, bottom: 40, left: 60 };
const width = 700
const height = 700

const svg = d3.select('#vis')
   .append('svg')
   .attr('width', width)
   .attr('height', height)
   .append('g')
    // we use a square canvas 
   .attr('transform', `translate(${width / 2},${height / 2})`);

const spiralArc = (fromRadius, toRadius, width, fromAngle, toAngle) => {
    const x1 = fromRadius * Math.sin(fromAngle);
    const y1 = fromRadius * -Math.cos(fromAngle);
    const x2 = (fromRadius + width) * Math.sin(fromAngle);
    const y2 = (fromRadius + width) * -Math.cos(fromAngle);
    const x3 = toRadius * Math.sin(toAngle);
    const y3 = toRadius * -Math.cos(toAngle);
    const x4 = (toRadius + width) * Math.sin(toAngle);
    const y4 = (toRadius + width) * -Math.cos(toAngle);
    return `
        M ${x1},${y1} 
        L ${x2},${y2} 
        A ${fromRadius},${fromRadius} 1 0 1 ${x4},${y4} 
        L ${x3},${y3}
        A ${fromRadius},${fromRadius} 0 0 0 ${x1},${y1}`;
}

// The main function that builds the visualization
// We pass the dataset as a parameter
function createVis(data) {
    const BASE_RADIUS = 30;
    const OFFSET = 0.25;
    const angle = Math.PI * 2 / 365;

    const colorScale = d3.scaleSequential().range(["lightyellow", "red"])
        .domain([0, d3.max(data.map(d => d.newConfirmed))]);

    let caseScale = d3.scaleLinear([1, d3.max(data.map(d => d.newConfirmed))], [1, 150])

    for (let index = 0; index < data.length; index++) {

        const height = caseScale(data[index].newConfirmed)
        const fromAngle = angle * index;
        const toAngle = angle * (index + 1);
        const fromRadius = toRadius = BASE_RADIUS + index * OFFSET  - height / 2
        const path = spiralArc (fromRadius, toRadius, height, fromAngle, toAngle);

        const color = colorScale(data[index].newConfirmed)
        svg.append('path').attr('d', path).style('fill', color)

        const formatYear = d3.timeFormat("%Y")
        const formatMonth = d3.timeFormat("%b")
        
        const year = data[index].date.getFullYear();
        const month = data[index].date.getMonth();

        if (data[index].date.getDate() === 12 && data[index].date.getMonth() === 0) {
            let yearRadius = fromRadius
            // Offset to align the first day in a month
            let yearAngle = fromAngle - angle * 12  
            svg.append('g')
                .attr("transform", `translate(${Math.sin(yearAngle) * yearRadius}, 
                    ${-Math.cos(yearAngle) * yearRadius})`)
                .append("text")
                .attr('dx', 0)
                .attr('dy', 0)
                .text(formatYear(data[index].date).toLowerCase())
                .attr("font-weight", 550)
                .attr("font-size", 10)
                .style('text-transform', 'small-caps')
                .style('fill', 'black')
                .style('text-anchor', 'middle')
                .attr('class', 'labels')
        }

        if (data[index].date.getDate() === 1 && ((year === 2021 && month >= 9) || (year === 2022 && month <= 8))) {
            let textRadius = fromRadius + 30 
            svg.append('text')
                .attr("transform", `translate(${Math.sin(fromAngle) * textRadius}, 
                    ${-Math.cos(fromAngle) * textRadius})`)
                .text(formatMonth(data[index].date).toLowerCase())
                .attr("font-weight", 550)
                .attr("font-size", 14)
                .style('font-variant', 'small-caps')
                .style('fill', 'black')
                .style('text-anchor', 'middle')
                .attr('class', 'labels')
        }
        
    }

    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 2 + margin.top)
        .text('2020-2023 covid-19 cases in the usa')
        .style('fill', '#555555')
        .style('font-size', 16) 
        .style("font-weight", 600)
        .style('text-anchor', 'middle')
        .style('text-transform', 'uppercase')

    svg.append('text')
        .attr('x',   0)
        .attr('y',  -height / 2  + margin.top + 20)
        .text('color picked for aesthethics and might not be truthful')
        .style('fill', '#888888')
        .style('font-size', 12) 
        .style('text-anchor', 'middle')
        .style("font-weight", 400)

    const legendData = [10000, 50000, 100000, 250000, 500000, 1000000, 1500000]

    const legendX = -width / 2 + 40;
    const legendY = height / 2 - 80;

    const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    legendGroup.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 30)
        .attr("y", (d, i) => i * 10) 
        .attr("width", d => caseScale(d))
        .attr("height", 10)
        .style("fill", d => colorScale(d));

    legendGroup.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", -20)
        .attr("y", (d, i) => i * 10 + 8) 
        .text(d => d.toLocaleString()) 
        .attr("font-size", 10)
        .style("fill", "black");
}

// Load and process data
function init() {
    d3.csv("data/COVID_US_cases.csv", d => ({
        date: new Date(d.date),
        newConfirmed: +d.new_confirmed > 0 ? +d.new_confirmed : 0  
    })).then(data => {
        console.log(data); // Debugging check
        createVis(data);   // Call visualization function
    });
}

// Run `init()` when the page loads
window.addEventListener('load', init);