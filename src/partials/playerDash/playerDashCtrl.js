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
    $scope.message = "";
    $scope.danger = false;

    $scope.getGames = function(){

        apiService.get("/api/v1/getplayergames",null,true).then(function(data){
            $scope.yourGames = data.data;
            console.log(data.data);
        },function(error){
            console.log(error);
        });

        apiService.get("/api/v1/getallgames",null,true).then(function(data){
            $scope.allGames = data.data;
            console.log(data.data);
        },function(error){
            console.log(error);
        });

    };

    $scope.createGame = function(){
        apiService.post("/api/v1/creategame",null,{name:$scope.gameName,monopolies:$scope.monopolies},true).then(function(data){
            $scope.allGames = data.data.games;
            $scope.gameName = "";
            $scope.monopolies = 0;
            $scope.message = data.data.message;
            $scope.danger = false;
        },function(error){
            $scope.message = error.data.message;
            $scope.danger = true;
        });
    };

    $scope.joinGame = function(gameId){
        console.log(gameId);
        apiService.post("/api/v1/addplayer",null,{game:gameId},true).then(function(data){
            $scope.message = data.data.message;
            $scope.danger = false;
            $scope.getGames();
        },function(error){
            $scope.message = error.data.message;
            $scope.danger = true;
        });
    }

    //call get games
    $scope.getGames();
}]);
