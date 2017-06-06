(function($P){
  'use strict'
   $P.Patterns =$P.defineClass(
   				null,
   				function Patterns(config){
   					var self=this; 

   					//read the MC1 data
   					d3.csv("./data/sensor.csv", function(data){
   						self.data = data; 
   						
   						//Create SVG for drawing
	   					var height = 1300; 
	   					var width= 8000;
	   					var margin = {top: 0, right: 10, bottom: 20, left: 0};
	   					self.svg = d3.select("article").append("svg")
					          .attr("width", width)
					          .attr("height", height)
					          .append("g")
					          .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
					          .attr("max-width", "90%");

   					// Draw a dummmy hexagon
   					self.drawHexa();
   					});
   				},
   				{
   					drawHexa: function(){
   						var self=this;
					    var _s32 = (Math.sqrt(3)/2);
				        var A = 64;
				        var pointData = [[A, 0], 
				        				[A/2, A*_s32],	
				        				 [-A/2, A*_s32],
				        				 [-A, 0],
				        				 [-A/2, -A*_s32], 
				        				 [A/2, -A*_s32],
				        				 [A,0]]
				        				 ;
				        self.g = self.svg.append("g")
				        			.attr("transform", "translate(160,160)");

				        var enterElements = self.g.selectAll("path.area") //draw elements
				                .data([pointData]).enter().append("path")				                
				                .style("fill", "#ff0000")
				                .style("stroke", "black")
				                .attr("d", d3.svg.line());
				         self.drawRect();
				                
					},
					drawRect: function(){
						var self = this;
						var A = 64;
						var _s32 = (Math.sqrt(3)/2);
						var g1 = self.g.append("rect")
							.attr("x", (-A/2) )
							.attr("y", (-A*_s32)-A)
							.attr("width", A)
							.attr("height", A)
							.style("fill", "#00ff00");

					},
					uniqueCars: function(){
						var self=this;
						var uniqueIDs = {};
						for(var d=0; d < self.data.length; d++ ){
							if(!uniqueIDs[self.data[d].carid])
								uniqueIDs[self.data[d].carid] = 1; 
						}
						var uniqueArr = [];
						for(var key in uniqueIDs)
							uniqueArr.push(key);
						//console.log(uniqueArr);
						return uniqueArr;

   					},
   					getMaxFrequency: function(days){
   						var maxFreq = 0; 
   						for(var d=0; d < days.length; d++){
   							for(var i=0; i<days[d]['values'].length; i++){
   								for(var sensorT in days[d]['values'][i]){
   									// aggregate sum over all vehicle types in this sensor type in this interval
   									var sum = 0;
   									for(var key in days[d]['values'][i][sensorT]){
   										sum += days[d]['values'][i][sensorT][key];
   									}
   									if(sum > maxFreq)
   											maxFreq = sum;
   								}
   							}
   						}
   						return maxFreq; 
   					},
   					listCars: function(uCars){
   						var self=this;
   						var carNodes = self.svg.selectAll(".cnode")
   											.data(uCars)
   											.enter().append("g");
   						var x = 20;
   						var y = 20;
   						var cars = carNodes.append("rect")
						        	.attr("class", "cnode")
						            .attr("x", function(d) { 
						            	return x; })
						            .attr("y", function(d) {
						            	 return y+= 7; })
						            .attr("width", function(d) { 
						            	return 30;  })
						            .attr("height", function(d) { 
						            	return 20; })
						            .style("fill", function(d) { 
						            	   return "lightgrey"; })
						            .style("stroke-width", '1px')
						            .style("stroke", function(d) { 
						            	return "black"; })
						            .on("click",function(){});
						     
   					},
   				});
var pat = new $P.Patterns();
})(PARK);