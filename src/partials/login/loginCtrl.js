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
