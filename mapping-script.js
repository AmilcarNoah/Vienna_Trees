/* VISUALIZATION SETUP */
var width = 300; 
var height = 150;  

var div = d3.select("body") // Select the body of the website
.append("div") // Add the container for the tooltip content
.attr("class", "tooltip") // Add class name to the container
.style("opacity", 0) // Set the initial transparency of tooltip to 0 – invisible

var svg = d3.select("#mapContainer")  // Select the #mapContainer element within the HTML file
  .append("svg")  // Add the <svg> element to this container
  .attr("preserveAspectRatio", "xMidYMid")  // Preserve the aspect ratio of the <svg> element
  .attr("viewBox", [0, 0, width, height])  // Set the position and dimension, in user space, of an SVG viewport - setting for the responsive design
  .attr("title", "Trees in Vienna");  // Add the title of the <svg> element

var g = svg.append("g");
var l = svg.append("g");

var projection = d3.geoAzimuthalEquidistant()  //d3.geoAzimuthalEquidistant(); // or d3.geoEquirectangular()  
var path = d3.geoPath()
  .projection(projection);

d3.json("data/streets-oldtown.geojson")
  .then(function(streets) {
    // Process streets data (if needed)
  })
  .catch(function(error) {
    alert("There was an issue loading the street dataset. Please try again later.");
  });

d3.json("data/streets-oldtown.geojson")  
  .then(function(streets) {
    projection.fitSize([width, height], streets);

    l.selectAll("path")
      .data(streets.features)  
      .enter()  
      .append("path")  
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgb(112,128,144)")
      .attr("stroke-width", 0.3)  // Set stroke width
      .attr("stroke-opacity", 0.7);
  })
  .catch(function(error) {
    alert("There was an issue loading the street dataset. Please check the file path and try again.");
  });

d3.json("data/trees-oldtown.geojson")       
  .then(function(trees) {
    g.selectAll("trees")  // Take the "tree" selector and return a selection of all such elements
      // .data(trees.features)
      .data(trees.features
        .filter( function(d) {
          return d.properties.PlantingYear < 2020 &&
          d.properties.TrunkSize < 100
        })
      )
      .enter()  // Bind data to the selection
      .append("circle")  // Append circle symbol for each data entry
      .attr('cx', function(d) {  // Set the x-coordinate of the circle
        return projection(d.geometry.coordinates)[0];
      })           
      .attr('cy', function(d) {  // Set the y-coordinate of the circle  
        return projection(d.geometry.coordinates)[1];
      })     
      .attr('r', 3)  // Set size (radius) of the circle
      .attr("stroke", "#6b9023")
      .attr("stroke-width", 0.5)
      // .attr("stroke-opacity", 1)
      // .attr("fill", "Yellowgreen")
      .attr("fill-opacity", 0.5)
      .attr('stroke', function(d) {
        if (d.properties.PlantingYear >= 2010 && d.properties.PlantingYear < 2020) {
          return "red"; 
        } else if (d.properties.PlantingYear >= 2000 && d.properties.PlantingYear < 2010) {
          return "orange"; 
        } else if(d.properties.PlantingYear >= 1990 && d.properties.PlantingYear < 2000){
          return "blue";
        }
        else {
          return "Pink"; 
        }})
      // .attr("r", function(d) { 
      //   let scale = d3.scaleSqrt()
      //     .domain([0, 600])
      //     .range([0, 10]);
      //   let radiusSize = d3.scaleLinear()  
      //     .domain([0, 300, 600])
      //     .range([1, 5, 10])
      //   return radiusSize(d.properties.TrunkSize)
      // })

      .attr("r", function(d) {
        let smallestTree = d3.min(trees.features, function(d) {
          return d.properties.TrunkSize;
          })
        let biggestTree = d3.max(trees.features, function(d) {
          return d.properties.TrunkSize;
          })
        let radiusSize = d3.scalePow()
        .domain([smallestTree, 200,400,600,800, biggestTree])
        .range([0,2,4,6,8,10])
        return radiusSize(d.properties.TrunkSize)
      })
      
      .attr("fill", function(d){
        let treeColor = d3.scaleSqrt()
        .domain([0,2,4,6,8]) 
        .range(["white","blue","green","yellow","orange"]) // Set colour values
        return treeColor(d.properties.TreeHeight)
      })

      // .attr("fill", function(d){
      //   let colorScale = d3.scaleOrdinal() // Set scale type to ordinal
      //   .domain(["Tilia cordata 'Greenspire' (Stadtlinde)", "Celtis australis (Südlicher Zürgelbaum)",
      //   "Acer pseudoplatanus 'Atropurpureum' (Purpurner Bergahorn)"]) // Give names of the tree types
      //   .range(["pink", "yellow", "green"]) // Display each tree type with its distinct colour name
      //   return colorScale(d.properties.TreeType)
      // })

      .on("dblclick", function(event, d) {
        d3.select(this)
          .raise()
          .transition()
          .duration(400)
          .attr("fill","red")
          .attr("stroke-width",2)
          .attr("cursor","pointer")
          div.transition()
            .duration(700)
              .style("opacity", 5);

          //do something with our tree
        })
      .on("click", function(event, d) {
        d3.select(this) // Select the single tree which is being hovered over
          .raise() // Display the selected tree on the top of other trees
          .transition() // Set the smooth transition – animation from current tree state to “hovered” state
          .duration(700) // Set the time for transition - in milliseconds
          .attr("fill", "blue") // Change tree colour to yellow
          .attr("stroke-color", blue) // Change the thickness of the circle stroke
          .attr("cursor", "pointer") // Change default mouse cursor to pointer with the finger
          })
      .on("mouseover", function(event, d) {
        d3.select(this) // Select the single tree which is being hovered over
          .raise() // Display the selected tree on the top of other trees
          .transition() // Set the smooth transition – animation from current tree state to “hovered” state
          .duration(500) // Set the time for transition - in milliseconds
          .attr("fill", "yellow") // Change tree colour to yellow
          .attr("stroke-width", 2) // Change the thickness of the circle stroke
          .attr("cursor", "pointer") // Change default mouse cursor to pointer with the finger
          div.transition()
            .duration(10) // Set time until tooltip appears on the screen (in milliseconds)
              .style("opacity", .9); // Set the transparency of the tooltip to 90%
            // Display the data-driven text in the tooltip, e.g., year of planting
            div.html("Planted in " + d.properties.PlantingYear + "<br>" + "Tree Type: " + d.properties.TreeType)
              .style("position", "absolute") // set from where the positional coordinates are counted
              .style("left", (event.pageX + 10) + "px") // Set horizontal position of the tooltip - horizontal distance from the mouse pointer in pixels, e.g., 10px
              .style("top", (event.pageY - 10) + "px") // Vertical position of the tooltip - vertical distance from the mouse pointer in pixels, e.g., 10px
                    })
        .on("mouseout", function(event, d) {
          /* Define the behavior once a mouse pointer leaves tree symbol */
                  d3.select(this)
                    .lower() // Display the selected tree on the bottom of other trees (move to back)
                    .transition() // Set the smooth transition – animation from “hovered” to “unhovered” state
                    .duration(500) // Set the time for transition - in milliseconds
                    .attr("stroke-width", 1) // Reset the stroke thickness to initial value
                    .attr("fill", "yellowGreen") // Reset the tree colour to initial value
                    div.transition()
                      .duration(10) // Set time until tooltip appears on the screen
                      .style("opacity", 0) // Set the transparency of the tooltip to 0%
                    
                })
      
        

          })
  .catch(function(error) {  // Display message if any data errors occur 
    alert("There are some mistakes in the code with the trees dataset");
  });


 
var zoom = d3.zoom() // Create zoom and pan behavior
  .scaleExtent([1, 8]) // Set how far can you zoom [out, in] your map
  .on('zoom', function(event) {
      l.attr('transform', event.transform) // Scale trees when zoomed in / out
      g.attr('transform', event.transform) // Scale streets when zoomed in / out
  })
svg.call(zoom)

function zoomIn() {
  d3.select('svg')
    .transition(1)
    .call(zoom.scaleBy, 2)
  }

function zoomOut() {
  d3.select('svg')
    .transition(1)
    .call(zoom.scaleBy, 0.5);  // Zoom out by a factor of 0.5
}

function resetZoom() {
  // Reset the zoom scale and translation to the default values
  d3.select('svg')
    .transition().duration(200) // Optional transition for smooth reset
    .call(zoom.transform, d3.zoomIdentity); // Reset to no zoom or pan
}





