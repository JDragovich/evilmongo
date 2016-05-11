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
