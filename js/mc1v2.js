(function ($p){
	'use strict'
	$p.Patterns = $p.defineClass(
					null,
					function Patterns(config){
   					var self=this; 

   					//read the MC1 data
   					d3.csv("./data/sensor.csv", function(data){
   						self.data = data; 
   						//console.log(data.length);
   						//console.log(self.data);
   						// Create a list of unique car IDs
   						//var uCars = self.uniqueCars();
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
   					self.drawHexa();

   					});
   					
   					
   					
   				},
   				{
   					
				            drawHexa:function(){







				            },
				            drawRect:function(){},
				            createWeekly:function(){},
				            drawWeekly:function(){},
				            drawWeeklyGlyph:function(){}

					});

var pat= new $p.Patterns();
})(PARK);

