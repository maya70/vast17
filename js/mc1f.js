(function ($P) {
    'use strict'
    $P.Patterns = $P.defineClass(
                 null,
                 function Patterns(config) {
                     var self = this;

                     //read the MC1 data
                     d3.csv("./data/sensor.csv", function (data) {
                         self.data = data;
                         
                         //Create SVG for drawing
                         var height = 1300;
                         var width = 1000;
                         var margin = { top: 0, right: 10, bottom: 20, left: 0 };
                         self.svg = d3.select("article").append("svg")
                               .attr("width", width)
                               .attr("height", height)
                               .append("g")
                               .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
                               .attr("max-width", "90%");

                         

                         // Draw
                        self.drawHexa();
                         //self.drawRect();

                     });


                 },
                 {
                     drawHexa: function () {


                         
                         var self = this;
                         var _s32 = (Math.sqrt(3) / 2);
                         var A = 165;
                         var pointData = [[A, 0],
                                          [A / 2, A * _s32],
                                          [-A / 2, A * _s32],
                                          [-A, 0],
                                          [-A / 2, -A * _s32],
                                          [A / 2, -A * _s32],
                                          [A, 0]];

                         self.g = self.svg.append("g")
                                  .attr("transform","translate(100,100)");
                         
                         var enterElements = self.g.selectAll("path.area")
                                   .data([pointData]).enter().append("path")
                                    .style("fill", "#ff0000")
                                     .style("stroke", "black")
                                    .attr("d", d3.svg.line());
                                    
                       
                                    
                     },
                     drawRect: function () {

                         var self = this;
                         var A =64;
                         var _s32=(Math.sqrt(3)/2);
                         var g1 = self.svg.append("rect")
                            .attr("x", (-A / 2))
                            .attr("y", (-A * _s32) - A)
                            .attr("width", A)
                            .attr("height", A)
                            .style("fill", "#00ff00");
                     },
                     createWeeekly: function () {

                     },
                     drawWeeklyHexa: function () {

                     },
                     drawWeeklyGlyph: function () {

                     }
                 });
    var pat = new $P.Patterns();


})(PARK);