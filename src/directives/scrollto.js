angular.module("main").directive('scrollOnClick', function() {
  return {
    restrict: 'A',
    link: function(scope, $elm, attrs) {
      var idToScroll = attrs.scrollto;
      $elm.on('click', function() {
        var $target;
        if (idToScroll) {
          $target = $(idToScroll);
        } else {
          $target = $elm;
        }
          console.log($target);
        $("body").animate({scrollTop: $target.offset().top}, "slow");
      });
    }
  }
});