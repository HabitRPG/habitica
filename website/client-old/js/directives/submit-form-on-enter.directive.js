'use strict';

(function(){

  angular
    .module('habitrpg')
    .directive('submitOnMetaEnter', submitOnMetaEnter);

  function submitOnMetaEnter() {
    return {
      restrict: 'A',
      link: function($scope, element, attrs) {
        element.on('keydown', function(event) {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            // Note that we use the normal browser way to invoke the submit
            // event, because jquery's triggerHandler executes events in a
            // strange order!
            var event = new Event('submit');
            element[0].form.dispatchEvent(event);
          }
        });
      }
    }
  }
}());
