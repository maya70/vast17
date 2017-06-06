(function($P){

'use strict'
$P.Patterns=$P.defineClass(
    null,function Patterns(config) {
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

                      
					 //TODO: count vehicles by type per week and send this data to drawWeek 
					 // the data sent from here should replace the data read from dummy.csv
   					// Draw weekly glyph
   					    self.drawWeek();
		                
	
					});	
		
	},

	{
	  drawWeek: function(){
		var self=this; 
		var _s32 = (Math.sqrt(3)/2);
        var A = 70;
        
        var pointData = [[A,0], [(A/2), (A*_s32)], [(-A/2), (A*_s32)], [-A,0],
	  					[(-A/2), (-A*_s32)], [(A/2), (-A*_s32)]];
        

	  	var gx = 150, gy = 150; 

		self.g= self.svg.append("g")
			        .attr("transform","translate("+gx+","+gy+")");
		 
        var enterElements = self.g.selectAll("path.area") //draw elements
                .data([pointData]).enter().append("path")
			    .style("fill", "#d11aff")
		        .attr("d", d3.svg.line());
				//.attr("transform","translate(100,100)");
		  
		 //our basic data 
    	self.drawHeatMap(gx,gy);
	  },
	  drawHeatMap : function (gx, gy) {
	  	var self = this; 
	  	var _s32 = (Math.sqrt(3)/2);
        var A = 70;
        
	  	d3.csv('./data/dummy.csv', function(data){ // this reads dummy data for one week --> should be removed and replace with real data
	  		 var gridSize = 10;
	  		 var buckets = 9; 
	  		 var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
	  		
							  		
			var rectData = [
		        { "x": -A/2, "y": A*_s32,"r":180},
		        { "x": -A/2, "y": A*_s32, "r":-120},
		        { "x": -A/2, "y": A*_s32, "r":0},
				{ "x": -A/2, "y": A*_s32,"r":60},
				{ "x": -A/2, "y": A*_s32,"r":120},
				{ "x": -A/2, "y": A*_s32,"r":-60},
		     ];
    
    		// get the min and max of all values
    		var min = 10000000, max = 0;
    		for(var r = 0; r < data.length; r++){
    			if(data[r]['v1'] > max) max = data[r]['v1'];
    			if(data[r]['v1'] < min) min = data[r]['v1'];
    			if(data[r]['v2'] > max) max = data[r]['v2'];
    			if(data[r]['v2'] < min) min = data[r]['v2'];
    			if(data[r]['v3'] > max) max = data[r]['v3'];
    			if(data[r]['v3'] < min) min = data[r]['v3'];
    			if(data[r]['v4'] > max) max = data[r]['v4'];
    			if(data[r]['v4'] < min) min = data[r]['v4'];
    			if(data[r]['v5'] > max) max = data[r]['v5'];
    			if(data[r]['v5'] < min) min = data[r]['v5'];
    			if(data[r]['v6'] > max) max = data[r]['v6'];
    			if(data[r]['v6'] < min) min = data[r]['v6'];
    				
    		}
       	 	var colorScale = d3.scale.quantile()
						              .domain([min, buckets - 1, max])
						              .range(colors);

		     //create heatmal skeletons and draw the heatmaps

			for(var j = 0; j < rectData.length; j++){
				 var value = 'v'+(j+1);
				 var rectg = self.g
							.append("g")
							.attr("transform", function(d) { return "translate("+rectData[j].x+","+rectData[j].y+")";})
							.attr("transform",function (d) {return "rotate(" + ( rectData[j].r) +")" });
		
						rectg.append("rect")
							.attr("x", function (d) { return 0; })
							.attr("y", function (d) { return 0; })
							.attr("width", A)
		                    .attr("height", 60)
		                    .attr("transform", function(d){return "translate("+rectData[j].x+","+rectData[j].y+")";})
							.style("fill","blue");
							
				  
		  		 var cards = rectg.selectAll(".hour")
						              .data(data, function(d) {return d.day+':'+d.hours;});
				 
	              cards.enter().append("rect")
	              .attr("x", function(d) { return (d.day - 1) * gridSize; })
	              .attr("y", function(d) { return (d.hours - 1) * gridSize; })
	              .attr("rx", 1)
	              .attr("ry", 1)
	              .attr("class", "hour bordered")
	              .attr("width", gridSize)
	              .attr("height", gridSize)
	              .style("fill", 'white')
	             .attr("transform", "translate("+rectData[j].x+','+rectData[j].y+")");
	             // .attr("transform", "rotate("+rectData[0].r+")");

	              cards.transition().duration(100)
	              .style("fill", function(d) { return colorScale(d[value]); });
	              
	             
	          cards.exit().remove();
	      }

	  	});
	  },
	  drawWeeklyHexa : function () {
	  },
	  drawWeeklyGlyph: function () {
	  }

	
    });

var pat= new $P.Patterns(); //create object from class patterns


})(PARK);