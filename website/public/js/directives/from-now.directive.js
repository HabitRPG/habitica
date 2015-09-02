'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('fromNow', fromNow);

  fromNow.$inject = [
    '$interval',
    '$timeout'
  ];

  function fromNow($interval, $timeout) {
    return function($scope, element, attr){
      var interval, timeout;

      var updateText = function(){
        element.text(moment($scope.message.timestamp).fromNow());
      };

      var setupInterval = function() {
        if(interval) $interval.cancel(interval);
        if(timeout)  $timeout.cancel(timeout);

        var diff = moment().diff($scope.message.timestamp, 'minute');

        if(diff < 60) {
          // Update every minute
          interval = $interval(updateText, 60000, false);
          timeout = $timeout(setupInterval, diff * 60000);
        } else {
          // Update every hour
          interval = $interval(updateText, 3600000, false);
        }
      };

      updateText();
      setupInterval();

      $scope.$on('$destroy', function() {
        if(interval) $interval.cancel(interval);
        if(timeout)  $timeout.cancel(timeout);
      });
    }
  }
}());
