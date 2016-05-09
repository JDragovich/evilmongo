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
            
            var finishedUrl = url(url,arguments);
            if(authenticate){
                return $http.post(finishedUrl,data, {headers:authService.getAuthHeader()});
            }
            else{
                return $http.post(finishedUrl);
            }
            
        }
    } 
}]);