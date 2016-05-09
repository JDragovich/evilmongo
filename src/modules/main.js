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
