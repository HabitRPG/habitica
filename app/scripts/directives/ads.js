'use strict';

angular.module('habitRPG')
  .directive('habitAds', function () {
    return {
      templateUrl: "views/ads.html",
      transclude: true,
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the ads directive');
      }
    };
  });
