function caps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// some colour variables
var tcBlack = "#130C0E";

// rest of vars
var w = 1000,
    h = 800,
    maxNodeSize = 2,
    x_browser = 20,
    y_browser = 25,
    root;
 
var vis;
var force = d3.layout.force(); 

vis = d3.select("#vis")
  .append("svg")
  .attr("width", w)
  .attr("height", h);
 
d3.json("https://raw.githubusercontent.com/3milychu/csmi-data/master/data/all.json", function(json) {

  var format = d3.format("");

    json.forEach(function(d) {
        d.labels = format(d.labels);
    });
 
  json = json;

  json = json.filter(function(d) { 
            return d.size == 40000 & d.tag6 == 1});

  // create children hierarchy json

var newData = { name :"root", 
      path: "https://raw.githubusercontent.com/3milychu/csmi-data/master/assets/logo.jpg", 
      children : [] },
    levels = ["sheet"];

// For each data row, loop through the expected levels traversing the output tree
json.forEach(function(d){
    // Keep this as a reference to the current level
    var depthCursor = newData.children;
    // Go down one level at a time
    levels.forEach(function(property, depth ){

        // Look to see if a branch has already been created
        var index;
        depthCursor.forEach(function(child,i){
            if ( d[property] == child.name ) index = i;
        });
        // Add a branch if it isn't there
        if ( isNaN(index) ) {
            depthCursor.push({ name : d[property], children : []});
            index = depthCursor.length - 1;
        }
        // Now reference the new child array as we go deeper into the tree
        depthCursor = depthCursor[index].children;
        // This is a leaf, so add the last element to the specified branch
        if ( depth === levels.length - 1 ) depthCursor.push({ size : d.size, path: d.path, tag1: d.tag1, tag2: d.tag2, 
        tag3: d.tag3, tag4: d.tag4, tag5: d.tag5, tag6: d.tag6, sheet: d.sheet, first: d.first, last: d.last, contact: d.contact, 
        research_interests: d.research_interests, role: d.role, event_type: d.event_type, organization_name: d.organization_name,
        description: d.description, center_lab_name: d.center_lab_name, subject: d.subject, meeting_space: d.meeting_space, 
        where: d.where,
        event_name: d.event_name, event_date: d.event_date, course_name: d.course_name, instructor: d.instructor});
    });
});

  // 
  console.log(newData);
 
  root = newData;
  root.fixed = true;
  root.x = w / 2.5;
  root.y = h / 2.5;
 
 
        // Build the path
  var defs = vis.insert("svg:defs")
      .data(["end"]);
 
 
  defs.enter().append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");
 
     update();
});
 
 
// functions

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);
 
  // Restart the force layout.
  force.nodes(nodes)
        .links(links)
        .gravity(0.05)
    .charge(-500)
    .linkDistance(30)
    .friction(0.5)
    .linkStrength(function(l, i) {return 1; })
    .size([w, h])
    .on("tick", tick)
        .start();
 
   var path = vis.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });
 
    path.enter().insert("svg:path")
      .attr("class", "link")
      // .attr("marker-end", "url(#end)")
      .style("stroke", "#eee");
 
 
  // Exit any old paths.
  path.exit().remove();
 
 
 
  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id; });
 
 
  // Enter any new nodes.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", click)
      .call(force.drag);
 
  // Append a circle
  nodeEnter.append("svg:circle")
      .attr("r", function(d) { return Math.sqrt(d.size) / 40 || 1.5; })
      .style("fill", "#eee");

  // Append images
  var images = nodeEnter.append("svg:image")
        .attr("xlink:href",  function(d) { return d.path;})
        .attr("x", function(d) { return -10;})
        .attr("y", function(d) { return -10;})
        .attr("height", 20)
        .attr("width", 20);

  
  // make the image grow a little on mouse over and add the text details on click
  var setEvents = images
          // Append details text
          .on( 'click', function (d) {

            // Details if sheet is "People"
            if (d.sheet == "People") {
              d3.select("h1").html("Key Contributors").attr("class", "people"); 
              d3.select("h2").html(d.first + " " + d.last + "<br>" + d.role); 
              d3.select("h3").html ("<a href=mailto:'" + d.contact + "'>" + "Contact"+ "</a>")
            }

            // Details if sheet is "Events"
            if (d.sheet == "Events") {
              d3.select("h1").html("Event").attr("class", "event"); 
                d3.select("h2").html(caps(d.event_name) + "<br><br>" + caps(d.event_date.substring(0,50)) + 
                  "<br><br>" + d.where);
                if (d.event_type != 0) {
                   d3.select("h3").html (d.event_type)
                } else {
                  d3.select("h3").html ("")
                }
            }

            // Details if sheet is "Courses"
            if (d.sheet == "Courses") {
              d3.select("h1").html("Course").attr("class", "course"); 
                d3.select("h2").html(d.course_name.toLowerCase() + "<br><br>" + d.instructor.toLowerCase()); 
                d3.select("h3").html (d.school_college)
              // d3.select("#featured").html("<img src='" + d.src + "'>"); 
            }

            // Details if sheet is "Organization"
            if (d.sheet == "Organizations") {
              d3.select("h1").html("Organization").attr("class", "org"); 
                d3.select("h2").html(d.organization_name.toLowerCase() + "<br><br>" + d.description.toLowerCase()); 
              // d3.select("#featured").html("<img src='" + d.src + "'>"); 
            }

            // Details if sheet is "Centers/Labs"
            if (d.sheet == "Centers/Labs") {
              d3.select("h1").html("Center / Lab").attr("class", "center"); 
                d3.select("h2").html(d.center_lab_name.toLowerCase() + "<br><br>" + d.subject.toLowerCase()); 
                d3.select("h3").html ("<a href=mailto:'" + d.contact + "'>" + "Contact"+ "</a>")
              // d3.select("#featured").html("<img src='" + d.src + "'>"); 
            }
                
              
           })

          .on( 'mouseenter', function() {
            // select element in current context
            d3.select( this )
              .transition()
              .attr("x", function(d) { return -15;})
              .attr("y", function(d) { return -15;})
              .attr("height", 30)
              .attr("width", 30);
          })
          // set back
          .on( 'mouseleave', function() {
            d3.select( this )
              .transition()
              .attr("x", function(d) { return -10;})
              .attr("y", function(d) { return -10;})
              .attr("height", 20)
              .attr("width", 20);
          });

 
  // Exit any old nodes.
  node.exit().remove();
 
 
  // Re-select for update.
  path = vis.selectAll("path.link")
      .style("stroke-width","1px");
  node = vis.selectAll("g.node");
 
function tick() {
 
 
    path.attr("d", function(d) {
 
     var dx = d.target.x - d.source.x,
           dy = d.target.y - d.source.y,
           dr = Math.sqrt(dx * dx + dy * dy);
           return   "M" + d.source.x + "," 
            + d.source.y 
            + "A" + dr + "," 
            + dr + " 0 0,1 " 
            + d.target.x + "," 
            + d.target.y;
  });
    node.attr("transform", nodeTransform);    
  }
}

 
/**
 * Gives the coordinates of the border for keeping the nodes inside a frame
 * http://bl.ocks.org/mbostock/1129492
 */ 
function nodeTransform(d) {
  d.x =  Math.max(maxNodeSize, Math.min(w - (d.imgwidth/2 || 16), d.x));
    d.y =  Math.max(maxNodeSize, Math.min(h - (d.imgheight/2 || 16), d.y));
    return "translate(" + d.x + "," + d.y + ")";
   }
 
/**
 * Toggle children on click.
 */ 
function click(d) {
  if (d.children) {
    // d._children = d.children;
    // d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
 
  update();
}
 
 
/**
 * Returns a list of all nodes under the root.
 */ 
function flatten(root) {
  var nodes = []; 
  var i = 0;
 
  function recurse(node) {
    if (node.children) 
      node.children.forEach(recurse);
    if (!node.id) 
      node.id = ++i;
    nodes.push(node);
  }
 
  recurse(root);
  return nodes;
} 