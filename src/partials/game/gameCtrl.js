angular.module("main").controller("GameCtrl", ["$scope","$location","$http","$sce","$sanitize","$timeout","authService","apiService","$routeParams",function($scope,$location,$http,$sce,$sanitize,$timeout,authService,apiService,$routeParams){
        
    //Get game data
    apiService.get("/api/v1/getgame/:id",{id:$routeParams.gameId},true).then(function(data){
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