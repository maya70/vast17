(function($P){
  'use strict'
   $P.Patterns =$P.defineClass(
   				null,
   				function Patterns(config){
   					var self=this; 

   					//read the MC1 data
   					d3.csv("./data/sensor.csv", function(data){
   						self.data = data; 
   						//console.log(data.length);
   						//console.log(self.data);
   						// Create a list of unique car IDs
   						var uCars = self.uniqueCars();
   						//console.log(uCars.length);
	   					//var height= uCars.length * 5;
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

   					// Display a list of unique Car IDs
   					// self.listCars(uCars);

   					// Draw Days and Time slots
   					self.drawDays();

   					});
   					
   					
   					
   				},
   				{
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
   					drawDays: function(){
   						var self=this;
   						var days = [];
   						// extract day info from data
   						for(var i=0; i < self.data.length; i++ ){
   							//var date = new Date(self.data[i].time).toLocaleString();
   							//var day = date.getDay(); 
   							// parse date and time manually
   							var str = self.data[i].time;
   							var strs = str.split(" ");
   							var date = strs[0];
   							var hour = strs[1];
   							var temp = hour.split(":"); 
   							hour = temp[0];  // discard minutes
   							strs = date.split("-");
   							var day = strs[0];
   							var month = strs[1];
   							var year = "20"+strs[2];
   							date = year+"-"+month+"-"+day; 
   							// Create a unique list of dates and intervals within them
   							var numIntervals = 4;
   							var nhours = 24/numIntervals;
						
   							if(!days[date]) {
   								days[date] = [];
   								for(var h=0; h<numIntervals; h++){
   									days[date][h] = {};
   									// initialize sensor types
   									days[date][h].entrance = {};
   									days[date][h].general_gate = {};
   									days[date][h].gate = {};
   									days[date][h].ranger_stop = {};
   									days[date][h].ranger_base = {};
   									days[date][h].camping = {};
   								}
   							}
   							// Now update counts with the current data record   							
   							// find out this record's sensor type
   							var sensorT = self.data[i].gate;
   							if(!isNaN(sensorT.slice(-1)))
								sensorT = sensorT.substring(0, self.data[i].gate.length - 1);
   							sensorT = sensorT.replace("-", "_");
   							
   							// create or update the entry for this vehicle type under the sensor type within this interval
   							var intervalID = parseInt(hour/nhours);
   							if(!days[date][intervalID][sensorT][self.data[i].cartype])
   								days[date][intervalID][sensorT][self.data[i].cartype] = 1;
   							else
   								days[date][intervalID][sensorT][self.data[i].cartype]++; 
   						}
   						console.log(days);
   						
   						// turn days into an array of objects
   						var dayArr = [];
   						for(var key in days){
   							var obj = {};
   							obj.day = key;
   							obj.values= days[key];
   							dayArr.push(obj);
   						}
   						
   						var max= self.getMaxFrequency(dayArr);
   						console.log("Max Freq= "+ max);
   						console.log(dayArr);
   						var ypos = 0;
   						var xpos = 10;
   						var dayw = 35;
   						var dayCols = self.svg.selectAll(".dnode")
   								.data(dayArr)
   								.enter().append("g");
   						
   						var dayContainers = dayCols.append("rect")
						        	.attr("class", "dnode")
						            .attr("x", function(d) { 
						            	return xpos+=dayw; })
						            .attr("y", function(d) {
						            	 return ypos; })
						            .attr("width", function(d) { 
						            	return dayw;  })
						            .attr("height", function(d) { 
						            	return 110*numIntervals; })
						            .style("fill", function(d) { 
						            	   return "lightgrey"; })
						            .style("stroke-width", '1px')
						            .style("stroke", function(d) { 
						            	return "white"; })
						            .on("click",function(){});

						var sensorTypes = ['entrance', 'general_gate', 'gate', 'ranger_stop', 'ranger_base', 'camping'];
						var sensorColors= ['#33a02c', '#1f78b4', '#e41a1c','#ffff99' ,'#f0027f', '#fdc086' ];
						var vehicleTypes= ['1','2','3','4','5','6'];

						//var colorscale = d3.scale.ordinal().domain(sensorTypes).rangePoints(sensorColors);
						
						var colorMap = {};

						for(var j=0; j<sensorTypes.length; j++)
						{
							colorMap[sensorTypes[j]] = sensorColors[j];
						}
						for(var i=0; i < numIntervals; i++){
							xpos = 10; 
							var intervals = dayCols.append("g")
											.attr("transform", function(d){
												var y = (i) * 110; 
												xpos += dayw; 
												return "translate("+xpos+","+y+")";
											});
							var sensorBars = [], vehicleEllipses =[];
							var barw = (dayw-1)/(sensorTypes.length);
							for(var st = 0; st<sensorTypes.length; st++){
								var barh = 0; 
								var sBar = intervals.append("rect")
											.attr("x", function(d){
												return st* barw;
											})
											.attr("height", function(d){
												// aggregate by sensor type within this interval
												var sum=0;
												for(var v in d['values'][i][sensorTypes[st]])
													sum += d['values'][i][sensorTypes[st]][v];
												//console.log("Day "+ d.day + " interval "+ i + " has " + sum+ " vehicles at " + " entrance");
												barh = sum/max * 90;
												if(barh>90) console.log(barh);
												return barh; 
											})
											.attr("y", function(d){
												var newy = 0 ;
												return newy;
											})
											.attr("width", barw)
											.style("fill", function(d){
												return colorMap[sensorTypes[st]];
											});
								sensorBars.push(sBar);
							}
							for(var vt=0; vt<vehicleTypes.length; vt++){
								var vElli = intervals.append("ellipse")
											.attr("cx",function(d){ return 2+vt*4;})
											.attr("cy",100)
											.attr("rx", 2)
											.attr("ry", function(d){
												return (vt+1)*6/10;
											})
											.style("fill","none")
											.style("stroke","black");
								vehicleEllipses.push(vElli);
							}
							console.log(vehicleEllipses);
							//console.log(sensorBars);

							//create edges between bars and ellipses
							var edges = {};
							for(var dday=0; dday < dayArr.length; dday++){
								// get the amount of overlap between every pair of <vehicle,sensor> types
								var dedges = [];
								for(var s in dayArr[dday]['values'][i]){
									for(var v in dayArr[dday]['values'][i][s] ){
										if(dayArr[dday]['values'][i][s][v])
										{
											var weight= dayArr[dday]['values'][i][s][v];
											// find the (x,h) for the corresponding bar to this sensor type
											var xbar = sensorBars[sensorTypes.indexOf(s)][0][dday].x.baseVal.value + (barw/2);
											var hbar = sensorBars[sensorTypes.indexOf(s)][0][dday].height.baseVal.value;
											//if(dday === 90) console.log(weight);
											// find the (cx,cy) of the corresponding ellipse to this vehicle type
											if(v === '2P') v = 2;
											var cx = vehicleEllipses[v-1][0][dday].cx.baseVal.value;
											var cy = vehicleEllipses[v-1][0][dday].cy.baseVal.value;
											var edge = {};
											edge.weight = weight;
											edge.xstart = xbar;
											edge.ystart = hbar;
											edge.xend   = cx;
											edge.yend   = cy; 
											dedges.push(edge); 
										}
									}
								}
								edges[dayArr[dday].day] = dedges; 
							}
							//console.log(edges);
							
							intervals.append("g")
									.attr("class", "edge")
									.selectAll("line")
									.data(function(d){
											//console.log(edges[d.day]);
											return edges[d.day];
										})
										.enter().append("line")
										.attr("x1", function(dd){return dd.xstart;})
										.attr("y1", function(dd){return dd.ystart;})
										.attr("x2", function(dd){return dd.xend;})
										.attr("y2", function(dd){return dd.yend;})
										.style("stroke","black")
										.style("opacity", 0.1);


						}


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