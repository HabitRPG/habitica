'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('popoverHtml', popoverHtml);

  popoverHtml.$inject = [
    '$compile',
    '$timeout',
    '$parse',
    '$window',
    '$tooltip'
  ];

  function popoverHtml($compile, $timeout, $parse, $window, $tooltip) {
    return $tooltip('popoverHtml', 'popover', 'click');
  }
}());
