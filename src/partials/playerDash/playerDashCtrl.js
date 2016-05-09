angular.module("main").controller("DashCtrl", ["$scope","$location","apiService",function($scope,$location,apiService){
    
    //get the games
    apiService.get("/api/v1/getgames",null,true).then(function(data){
        $scope.yourGames = data.data;
    },function(error){
        console.log(error);
    });
    
    apiService.get("/api/v1/getallgames",null,true).then(function(data){
        $scope.allGames = data.data;
        console.log(data.data);
    },function(error){
        console.log(error);
    });
    
    $scope.createGame = function(){
        apiService.post("/api/v1/getallgames",null,true).then(function(data){
            $scope.allGames = data.data;
        },function(error){
            console.log(error);
        });
    }
    
    
    
}]);