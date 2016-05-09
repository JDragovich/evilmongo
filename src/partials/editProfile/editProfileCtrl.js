angular.module('main').controller("editProfileCtrl", ["$scope","apiService","authService",function($scope,apiService,authService){
    var playerId = angular.fromJson(authService.getToken()).id;
    
    apiService.get()
    
    $scope.changeProfile = function(){
        
    };
}]);