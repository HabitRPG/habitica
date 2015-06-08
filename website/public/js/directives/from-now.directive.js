'use strict';

angular
  .module('habitrpg')
  .directive('fromNow', fromNow);

fromNow.$inject = [
  '$interval'
];

function fromNow($interval) {
  return function(scope, element, attr){
    var updateText = function(){
      element.text(moment(scope.message.timestamp).fromNow())
    };
    updateText();
    // Update the counter every 60secs if was sent less than one hour ago otherwise every hour
    // OPTIMIZATION, every time the interval is run, update the interval time
    var intervalTime = moment().diff(scope.message.timestamp, 'minute') < 60 ? 60000 : 3600000;
    var interval = $interval(function(){ updateText() }, intervalTime, false);
    scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
  }
}
