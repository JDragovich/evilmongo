angular.module("main").controller("GameCtrl", ["$scope","$location","$http","$sce","$sanitize","$timeout","authService","apiService","$routeParams",function($scope,$location,$http,$sce,$sanitize,$timeout,authService,apiService,$routeParams){

    //game data handler
    var onGameDataReceived = function(data){
        console.log(data.data);
        $scope.players = data.data.game;
        $scope.playerInfo = data.data.playerInfo;
        $scope.players.board.forEach(function(element,i){
            element.index = i;
            element.houseArray = $scope.numToArr(i,element);
        });
        $scope.slides = $scope.players.board.slice(0,3);
        //console.log($scope.players.board);
    }

    //Get game data
    apiService.get("/api/v1/getgame/:id",{id:$routeParams.gameId},true).then(onGameDataReceived,function(error){
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
    $scope.numToArr = function(element){
        var array = [];
        for(var i=0; i<element.houses; i++){
            array.push({index:i,name:element.name + " " + (i + 1)});
        }
        return array;
    };

    $scope.endTurn = function(){
        apiService.post("/api/v1/endTurn",null,{game:$scope.players._id},true).then(onGameDataReceived,function(error){
            console.log(error.data)
            $scope.error = $sce.trustAsHtml(error.data);
        });
    };
    $scope.buyProperty = function(property){
        apiService.post("/api/v1/buyproperty",null,{property:property},true).then(onGameDataReceived,function(error){
            console.log(error.data)
            $scope.error = $sce.trustAsHtml(error.data);
        });
    };
}]);
