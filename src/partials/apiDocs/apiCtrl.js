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