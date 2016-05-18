  angular.module("main").directive("board",['$d3','$route', function($d3,$route){
    return{
        restrict:"E",
        scope:"=",
        link: function(scope,element,attrs){
            //set the internal coordinate system to the inital size set by the
            var internalSize = parseInt(attrs.size) || $(element).parent().innerWidth();
            var cellHeight = internalSize/8; //arbitrary space height
            //hash map for icon
            scope.icons = {
                "Chance":"\uf128",
                "Go":"\uf0a5",
                "Jail":"\uf19c",
                "Go To Jail":"\uf24e",
                "Free Parking":"\uf1b9",
                "Community Chest":"\uf128",
                "Utility":"\uf0eb",
                "Railroad":"\uf239",
                "Tax":"\uf295"
            }
            //get methods
            var d3 = $d3;
            var route = $route;
            scope.$watch('players', function(players) {
                if(players) {

                    d3.select(element[0]).selectAll('svg').remove();
                    var side = players.board.length / 4;
                    var board = [];

                    for(var i=0; i<4; i++){
                        board.push([]);
                        for(var j=side*i; j<side*(i+1);j++){
                            board[i].push(players.board[j]);
                        }
                    }

                    //remove previous svg and append new append svg
                    var boardSelec = d3.select(element[0])
                                .append("svg")
                                .attr("width", "100%")
                                .attr("height", "100%")
                                .attr("viewBox", "0 0 "+internalSize+" "+internalSize)
                                .append("g")
                                .attr("id","board-group")
                                .attr("transform","rotate(180 "+internalSize/2+" "+internalSize/2+")");


                    var sideSelec = boardSelec.selectAll(".side")
                                .data(board)
                                .enter()
                                .append("g")
                                .classed("side",true)
                                .attr("transform",getSidePos);

                    var space = sideSelec.selectAll(".space")
                                .data(function(d,i){ return d;})
                                .enter()
                                .append(getContents)
                                .classed("space", true)
                                .on("click",clicked)
                                .attr("transform",getCellPos)
                                ;

                    d3.select("#board-group")
                        .append("rect")
                        .classed("outer-border",true)
                        .attr("x",0)
                        .attr("y",0)
                        .attr("height",internalSize)
                        .attr("width",internalSize)

                    d3.select("#board-group")
                        .append("rect")
                        .classed("inner-border",true)
                        .attr("x",cellHeight)
                        .attr("y",cellHeight)
                        .attr("height",internalSize - (cellHeight * 2))
                        .attr("width",internalSize - (cellHeight * 2))


                    function clicked(d,i){
                        d3.select(".selected").classed("selected",false);
                        d3.select(this).classed("selected",true);
                        scope.setSlides(d.index);
                    };

                    function getWidth(d,i){
                        if(i === 0){
                            d.width = cellWidth * 2;
                            d.rotation = 135; //add icon rotation
                            return cellWidth * 2;
                        }
                        else{
                            d.width = cellWidth;
                            d.rotation = 180; //add icon rotation
                            return cellWidth;
                        }
                    };

                    function getCellPos(d,i){

                        if(i === 0){
                            d.x = 0;
                        }
                        else{
                            d.x = d.cellWidth * (i - 1) + cellHeight;
                        }
                        return "translate(" + d.x + ", 0 )";
                    };

                    function getSidePos(d,i){
                        return "rotate("+ 90 * i +" "+internalSize/2+" "+internalSize/2+")";
                    };

                    function getContents(d,i){
                        var group = d3.select(document.createElementNS(d3.ns.prefix.svg, 'g'));
                        var spaceCount = d3.select(this).data()[0].length; //get the number of spaces in the side

                        //a cell's width is determined by if it is the first cell. also teh icon rotation.
                        if(i === 0){
                            d.cellWidth = cellHeight;
                            d.rotation = 135;
                        }
                        else{
                            d.cellWidth = (internalSize - (cellHeight*2))/(spaceCount-1);
                            d.rotation = 180;
                        }

                        group.append("rect")
                                .attr("height", cellHeight)
                                .attr("x",0)
                                .attr("y",0)
                                .classed("main-space",true)
                                .attr("width", d.cellWidth)
                                ;

                        if(d.color){
                            group.append("rect")
                                .attr("width", d.cellWidth)
                                .attr("height", cellHeight * .25)
                                .attr("x", 0)
                                .attr("y", cellHeight * .75)
                                .attr("fill", d.color)
                                .classed("color-bar", true)
                                ;
                        }


                        group.append("text")
                            .classed("icon",true)
                            .attr("x",d.cellWidth * .5)
                            .attr("y",cellHeight * .6)
                            .attr("text-anchor","middle")
                            .attr("font-size",d.cellWidth / 2)
                            .attr("transform","rotate("+ d.rotation +","+ d.cellWidth * .5 +","+ cellHeight * .5 +")")
                            .text(scope.icons[d.category])
                            ;


                        if(d.houseArray || d.hotel){
                            //determine icon color
                            if(d.hotel){
                                var iconClass = "hotel-icon";
                            }
                            else{
                                var iconClass = "house-icon";
                            }


                            group.append("text")
                                .classed(iconClass,true)
                                .attr("text-anchor","middle")
                                .attr("y", cellHeight * .92)
                                .attr("x", d.cellWidth / 2)
                                .attr("font-size",d.cellWidth / 5)
                                .attr("transform","rotate("+ d.rotation +","+ d.cellWidth * .5 +","+ cellHeight * .875 +")")
                                .text(function(){
                                    if(d.hotel){
                                        return "\uf1ad"
                                    }
                                    else{
                                        var houses = " "
                                        for(var i =0; i<d.houseArray.length; i++){
                                            houses += "\uf015 "
                                        }
                                        return houses
                                    }
                                })
                                ;
                        }

                        group.append("line") //append dividing lines
                            .classed("cell-divider",true)
                            .attr("x1",d.cellWidth)
                            .attr("y1",0)
                            .attr("x2",d.cellWidth)
                            .attr("y2",cellHeight)
                            ;

                        return group.node();
                    }
                }

            }, true);
        }
    }
 }]);
