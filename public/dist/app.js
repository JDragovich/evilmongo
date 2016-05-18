//we'll put the router here in the future.
//the .config method registers work that needs to be done on module load, in this case the router
angular.module("main",['ngRoute','ngSanitize','ab-base64', 'ngD3']).config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        name: "Login Page",
        include: true,
        templateUrl: 'partials/login/login.html',
        controller: 'LoginCtrl'
      }).
      when('/editProfile', {
        name:"Edit Profile",
        templateUrl: 'partials/editProfile/editProfile.html',
        include:true,
        controller: 'editProfileCtrl'
      }).
      when('/playerDash/:gameId', {
        name: "bypass",
        include: false,
        templateUrl: 'partials/game/game.html',
        controller: 'GameCtrl'
      }).
      when('/games', {
        name: "Games",
        include: true,
        templateUrl: 'partials/playerDash/playerDash.html',
        controller: 'DashCtrl'
      }).
      when('/apiDocs', {
        name: "API Documentation",
        include: true,
        templateUrl: 'partials/apiDocs/api.html',
        controller: 'apiCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);

/*
 * A service the wraps url calls in a way that makes the easier to work with
 */

angular.module("main").factory("apiService",["$http","authService",function($http,authService){
    var urlBase = "/api/v1/";

    var makeUrl = function(fragment,arguments){
       var variable = "";
       if(arguments && typeof arguments === "object"){
           for(prop in arguments){
               variable = ":" + prop;
               fragment = fragment.replace(variable,arguments[prop]);
           }
       }

       return fragment;
    };

    return {
        setAPIbase:function(url){
           urlBase = "/api/v1/";
        },
        constructURL: function(fragment,arguments){

           return makeUrl(fragment,arguments);
        },
        get: function(url,arguments,authenticate){

            var finishedUrl = makeUrl(url,arguments);
            if(authenticate){
                return $http.get(finishedUrl, {headers:authService.getAuthHeader()});
            }
            else{
                return $http.get(finishedUrl);
            }

        },
        post: function(url,arguments,data,authenticate){

            var finishedUrl = makeUrl(url,arguments);
            if(authenticate){
                return $http.post(finishedUrl,data, {headers:authService.getAuthHeader()});
            }
            else{
                return $http.post(finishedUrl);
            }

        }
    }
}]);

angular.module("main").factory('authService',["$interval", "$location","$rootScope", function($interval,$location,$rootScope) {

    //check if token is good on route change.
    $rootScope.$on('$locationChangeStart', function(event) {
        if($location.path() !== '/login'){
            if (!localStorage.authToken || localStorage.authObjectExpires && localStorage.authObjectExpires > new Date().getTime()) {
               console.log("the token either does not exist are is expired, please login");
               localStorage.removeItem("authToken");
               localStorage.removeItem("authTokenExpires");
               $location.path('/login');
            }
        }
    });

    //interface object
    var authService = {
      startAuthCheck: function(authToken){
        localStorage.setItem("authToken", authToken.token);
        localStorage.setItem("authTokenExpires", authToken.expires);

        var checker = $interval(function(){
            if(localStorage.authObjectExpires > new Date().getTime() ){
                localStorage.removeItem("authToken");
                localStorage.removeItem("authTokenExpires");
                $location.path('/login');
                console.log(checker.cancel());
            }
        },5000);
      },
      getToken: function(){
          return localStorage.authToken;
      },
      getAuthHeader: function(){
          return {"x-auth-token":localStorage.authToken}
      }
  };

  return authService;
}]);


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

angular.module("main").directive("menuBar",['$route', function($route){
  return {
    restrict:"E",
    scope:"=", //Consider inheriting from parent
    templateUrl:'partials/menuBar/menuBar.html',
    link: function(scope, element, attrs) {
      scope.menuItems = [];
      angular.forEach($route.routes, function(value, key){
        scope.menuItems.push(value);
      });
    }
  }
}]);
/*
TODO: Check to see if player has games and add link to any games he has,
this will entail creating a controller for the directive which makes
an authentication call to see if there is a player and if they any games.
If they have games, these games to a dropdown
*/

angular.module("main").directive('scrollOnClick', function() {
  return {
    restrict: 'A',
    link: function(scope, $elm, attrs) {
      var idToScroll = attrs.scrollto;
      $elm.on('click', function() {
        var $target;
        if (idToScroll) {
          $target = $(idToScroll);
        } else {
          $target = $elm;
        }
          console.log($target);
        $("body").animate({scrollTop: $target.offset().top}, "slow");
      });
    }
  }
});
angular.module("main").controller("apiCtrl", ["$scope","$http","$sce","$sanitize",function($scope,$http,$sce,$sanitize){
    $scope.api = {};
    
    $http.get("/apiDocs").then(function(data){
        console.log(data.data);
        $scope.api = data.data;
    },function(error){
        console.log(error.data)
        $scope.data = $sce.trustAsHtml(error.data); 
    });
}]);
angular.module('main').controller("editProfileCtrl", ["$scope","apiService","authService",function($scope,apiService,authService){
    var playerId = angular.fromJson(authService.getToken()).id;
    
    apiService.get()
    
    $scope.changeProfile = function(){
        
    };
}]);
angular.module("main").controller("GameCtrl", ["$scope","$location","$http","$sce","$sanitize","$timeout","authService","apiService","$routeParams",function($scope,$location,$http,$sce,$sanitize,$timeout,authService,apiService,$routeParams){

    //Get game data
    apiService.get("/api/v1/getgame/:id",{id:$routeParams.gameId},true).then(function(data){
        console.log(data.data);
        $scope.players = data.data;
        $scope.players.board.forEach(function(element,i){
            element.index = i;
            if(element.color){
                element.houses = Math.round(Math.random() * 4);
                element.hotel = Math.random() > .75 ? true : false;
            }
            element.houseArray = $scope.numToArr(element.houses, element);
        });
        $scope.slides = $scope.players.board.slice(0,3);
        //console.log($scope.players.board);
    },function(error){
        console.log(error.data)
        $scope.error = $sce.trustAsHtml(error.data);
    });

    //set slides
    $scope.setSlides = function(index){

        if(index === 0){
            $scope.slides = [$scope.players.board[$scope.players.board.length - 1], $scope.players.board[0], $scope.players.board[1]];
        }
        else if(index === $scope.players.board.length - 1){
            $scope.slides = [$scope.players.board[$scope.players.board.length - 2], $scope.players.board[$scope.players.board.length - 1], $scope.players.board[0]];
        }
        else{
            $scope.slides = $scope.players.board.slice(index - 1,index + 2);
        }
        $scope.$apply();
    };

    //populate house array for data binding
    $scope.numToArr = function(num,element){
        var array = [];
        for(var i=0; i<num; i++){
            array.push({index:i,name:element.name + " " + (i + 1)});
        }
        return array;
    }
}]);

angular.module("main").controller("LoginCtrl", ["$scope","$http","$sce","$sanitize","base64","$location","authService","apiService",function($scope,$http,$sce,$sanitize,base64,$location,authService,apiService){
    $scope.userName = "";
    $scope.password = "";
    $scope.jsonData = "";

    $scope.setAuth = function(val){
        $http.post("/login",{username:$scope.userName, password:$scope.password}).then(function(data){//todo start here

            //get the token and put it in local sotrage
            authService.startAuthCheck(data.data);

            //redirect to the player Dash
            $location.path('/games');

        },function(error){
           console.log(error);
        });
    }

    $scope.createAcct = function(val){
        if($scope.newPassword === $scope.repeatNewPassword){
            $http.post("/register",{"email_address":$scope.newEmailAddress,
                                    "firstName":$scope.firstName,
                                    "lastName":$scope.lastName,
                                    "password":$scope.newPassword,
                                    "username":$scope.newUserName}).then(function(data){
                $scope.data = $sce.trustAsHtml(data.data);
            },function(error){
                console.log(error.data)
                $scope.jsonData = error.data;
            });
        }
        else{
            $scope.data = "Passwords don't match";
        }
    }

    $scope.testAuth = function(){
        apiService.get('/api/v1/test',null,true).then(function(data){
            $scope.jsonData = data.data;
        },function(err){
            $scope.jsonData = err
        });
    }
}]);

angular.module("main").controller("DashCtrl", ["$scope","$location","apiService",function($scope,$location,apiService){

    //get the games
    /*
    apiService.get("/api/v1/getgames",null,true).then(function(data){
        $scope.yourGames = data.data;
    },function(error){
        console.log(error);
    });
    */

    $scope.gameName = "";
    $scope.monopolies = 0;

    apiService.get("/api/v1/getallgames",null,true).then(function(data){
        $scope.allGames = data.data;
        console.log(data.data);
    },function(error){
        console.log(error);
    });

    $scope.createGame = function(){
        apiService.post("/api/v1/creategame",null,{name:$scope.gameName,monopolies:$scope.monopolies},true).then(function(data){
            $scope.allGames = data.data;
            $scope.gameName = "";
            $scope.monopolies = 0;
        },function(error){
            console.log(error);
        });
    }

}]);

//# sourceMappingURL=app.js.map