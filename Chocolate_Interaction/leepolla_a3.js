var width = 650;
var height = 400;
var margin = {top: 20, right: 15, bottom: 30, left: 40};
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;

var dataset; //the full dataset

var datasets = []
var pieSet

var linkCompany;
var linkOrigin;

function makeGroup(group, ind){
    // dropdowns mmade from this code http://bl.ocks.org/jfreels/6734823
    var subset = dataset
    datasets[ind] = subset
    var groupControls = d3.select('#controls')
        .append('div')
            .attr('id', group)

    d3.select('#' + group)
    .append('span')
    .text('Group ' + group + ' | Bean Origin: ')

    var selectBean = d3.select('#' + group)
      .append('select')
          .attr('id','selectBean')
          .attr('class',group)
        .on('change',changeBean)

    
    var optionsBean = selectBean
      .selectAll('option')
        .data(d3.map(dataset, function(d){return d.BroadBeanOrigin;}).keys()) //  Saw this unique value extraction at https://stackoverflow.com/questions/28572015/how-to-select-unique-values-in-d3-js-from-data
        .enter()
        .append('option')
            .text(function (d) { return d; });
    selectBean.append('option').text('all');

    document.querySelector('#'+group+ '> #selectBean').selectedIndex = 100


    d3.select('#' + group)
        .append('span')
        .text(' Company Location: ')

    var selectCompany = d3.select('#' + group)
        .append('select')
            .attr('id','selectCompany')
            .attr('class',group)
            .on('change',changeCompany)
          
    var optionsCompany = selectCompany
        .selectAll('option')
          .data(d3.map(dataset, function(d){return d.CompanyLocation;}).keys())
          .enter()
          .append('option')
              .text(function (d) { return d; });
    selectCompany.append('option').text('all');
    document.querySelector('#' + group + '> #selectCompany').selectedIndex = 60


    d3.select('#' + group)
        .append('button')
        .text("Group all data")
        .on('click', revertToAll)
    
    d3.select('#controls').append('br');          

    function revertToAll(){
        document.querySelector('#'+group+ '> #selectBean').selectedIndex = 100
        document.querySelector('#' + group + '> #selectCompany').selectedIndex = 60
        subset = dataset;
        datasets[ind] = subset
        drawVis();
    }
    
    function changeCompany() {
        selectValue = d3.select('#' + group).select('#selectCompany').property('value')
        subset = dataset
    
        otherSelection = d3.select('#' + group).select('#selectBean').property('value')
            if(otherSelection != 'all'){
            subset = subset.filter(function(row){
            
            return row['BroadBeanOrigin'] == otherSelection
            })
        }
    
        if(selectValue != 'all'){
            subset = subset.filter(function(row) {
                return row['CompanyLocation'] == selectValue
            })
        }
            datasets[ind] = subset
            drawVis()
    };
    
    function changeBean() {
        selectValue = d3.select('#' + group).select('#selectBean').property('value')
            subset = dataset
    
            otherSelection = d3.select('#' + group).select('#selectCompany').property('value')
            if (otherSelection != 'all'){
                subset = subset.filter(function(row){
                return row['CompanyLocation'] == otherSelection
            })
        }
           if (selectValue != 'all') {
         subset = subset.filter(function(row) {
                return row['BroadBeanOrigin'] == selectValue
            })
        }
            datasets[ind] = subset
            drawVis()
    };
}


    


function changePie() {
    var group = d3.select('#selectGroup').property('value')
    var type = d3.select('#selectType').property('value')

        var subset
        var subSelector
        if (group == 'Group A'){
            subset = datasets[1]
        }else{
            subset = datasets[2]
        }
       if (type == 'SpecificOrigin') {
            subset = d3.map(subset, function(d){return d.SpecificOrigin;}).keys()
        }else{
            subset = d3.map(subset, function(d){return d.Company;}).keys()
        }
        if(group != null && type != null){
            pieSet = subset;
            drawVis();
        }
};



d3.csv("flavors_of_cacao.csv", function(error, cacao) {
//read in the data
  if (error) return console.warn(error);
     cacao.forEach(function(d) {
     	d.rating = +d.Rating;
     	d.cocoa = + (d.CocoaPercent.slice(0, 2));
  });
//dataset is the full dataset -- maintain a copy of this at all times
  dataset = cacao;

  datasets[1] = cacao;
  datasets[2] = cacao;

  makeGroup('A', 1);
  makeGroup('B', 2);

  var pieControls = d3.select('#controls')
        .append('div')
            .attr('id', 'pieControls')
            .attr('float', "right")

    d3.select('#pieControls')
    .append('span')
    .text('Pie chart controls | Group Selector: ')

    var selectGroup = d3.select('#pieControls')
      .append('select')
          .attr('id','selectGroup')
        .on('change',changePie)

    
    var optionsGroup = selectGroup
      .selectAll('option')
        .data(['Group A', 'Group B']) 
        .enter()
        .append('option')
            .text(function (d) { return d; });

    d3.select('#pieControls')
            .append('span')
            .text(' Type Selector: ')

    var selectType = d3.select('#pieControls')
      .append('select')
          .attr('id','selectType')
        .on('change',changePie)

    var optionsType = selectType
      .selectAll('option')
        .data(['SpecificOrigin', 'Company']) 
        .enter()
        .append('option')
            .text(function (d) { return d; });
    document.querySelector('#selectGroup').selectedIndex = 0
    document.querySelector('#selectType').selectedIndex = 0

changePie()
});


var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").select('#visualization').append("div")
    .attr("class", "tooltip")
    .style("opacity", 1)
    .style("background", "violet")
    .style("position", 'absolute');

var pieInfo = d3.select("body").select('#visualization').append("div")
    .attr("id", "pieInfo")
    .style("opacity", 1)
    .style("background", "violet")
    .style("position", 'absolute');


var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, w]);

var y = d3.scaleLinear()
        .domain([0, 5])
        .range([h, 0]);

var xAxis = d3.axisBottom()
    .ticks(4)
    .scale(x);

chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
chart.append("text")
      .attr("x", w / 2 + 30)
      .attr("y", h + 25)
      .style("text-anchor", "end")
    .text("Cocoa Percentage");

var yAxis = d3.axisLeft()
    .scale(y);

chart.append("g")
   .attr("class", "axis")
   .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
chart.append("text")
    .attr("x", -w /4)
    .attr("y", -27)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
  .text("Chocolate Rating");



function drawVis() { //draw the circiles initially and on each interaction with a control
    var ind = 0
    var colors = ["orange", "blue"];
    datasets.forEach(function (subset){

    

	var circle = chart.selectAll(".group" + ind)
	   .data(subset);

	circle
    	  .attr("cx", function(d) { return x(d.cocoa);  })
          .attr("cy", function(d) { return y(d.rating);  })
          .attr('class', "group" + ind)
     	  .style("fill", colors[ind]);

	circle.exit().remove();

	circle.enter().append("circle")
    	  .attr("cx", function(d) { return x(d.cocoa);  })
    	  .attr("cy", function(d) { return y(d.rating);  })
          .attr("r", 4)
          .attr('class', "group" + ind)
    	  .style("stroke", colors[ind])
     //.style("fill", function(d) { return colLightness(d.vol); })
     	   .style("fill", colors[ind])
           .style("opacity", 0.3)
           .on("mouseover", function(d) {			
                tooltip.html("Company Location: " + d.CompanyLocation + "<br/>" + "Company Name: " + d.Company + "<br/>" + "Bean Origin: " + d.BroadBeanOrigin+ "<br/>" + "Specific Origin: " + d.SpecificOrigin)	
                .style("left", (d3.event.pageX + 8) + "px")		
                .style("top", (d3.event.pageY - 8) + "px")
                .style("opacity", 0.8);
                linkCompany = d.Company;
                linkOrigin = d.SpecificOrigin;
                drawVis();
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0)
                .style("left", 0 + "px")		
                .style("top", 0 + "px")
            });
        ind = ind + 1
    });



    var countries = pieSet
    var companyCounts = [];
    
    for(var country in countries){
        companyCounts.push([countries[country], datasets[document.getElementById('selectGroup').selectedIndex +1
    ].filter(function(row) {
            return row[d3.select('#selectType').property('value')] == countries[country]
        }).length])}


    var  r= 200;
    //var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    
    //started my pie chart from this persons code https://bl.ocks.org/arifb/3882186
    
    if(document.getElementById("pie")){
    document.getElementById("visualization").removeChild(document.getElementById("pie"));
    }
    var svg = d3.select("#visualization").append('svg')
    .data([companyCounts])
    .attr('width', '500')
    .attr('height', '500')
    .attr('id', 'pie')
    .append("g")
    .attr("class", "pieGroup")
    .attr('transform', 'translate(' + (500 / 2) +
            ',' + (500 / 2) + ')'),
    width = +svg.attr("width"),
    height = +svg.attr("height"),

    color = d3.scaleOrdinal(d3.schemeCategory20b);

    var group = d3.select('#selectGroup').property('value')
    var type = d3.select('#selectType').property('value')

    svg.append("text")
        .text( group + " Breakdown of \n" + type)
        .attr("y", -242)
        .attr("x", 69);
        var arc = d3.arc()
          .innerRadius(0)
          .outerRadius(250);

        var pie = d3.pie()
          .value(function(d) { return Number(d[1]); })


        var arcs = svg.selectAll("g.slice")
            .data(pie(companyCounts))
            .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc)    
                .attr("opacity",function(d){
                    if(d.data[0] == linkCompany || d.data[0] == linkOrigin)
                    {return 1}
                    else{
                        return 0.5
                    }});                                //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.on("mouseover", function(d) {			
            pieInfo.html("Name: " + d.data[0]  + "<br/>" + "Count: " + d.data[1])	
            .style("left", (d3.event.pageX + 8) + "px")		
            .style("top", (d3.event.pageY - 8) + "px")
            .style("opacity", 1);
            drawVis()
        })

      
    

}



