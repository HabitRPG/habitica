'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('popoverHtmlPopup', popoverHtmlPopup)
    .run(loadPopupTemplate);

  popoverHtmlPopup.$inject = [
    '$sce'
  ];

  function popoverHtmlPopup($sce) {
    return {
        restrict: 'EA',
        replace: true,
        scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
        link: function($scope, element, attrs) {
          $scope.$watch('content', function(value, oldValue) {
            $scope.unsafeContent = $sce.trustAsHtml($scope.content);
          });
        },
        templateUrl: 'template/popover/popover-html.html'
    };
  }

  /*
   * TODO: Review whether it's appropriate to be seeding this into the
   * templateCache like this. Feel like this might be an antipattern?
   */

  loadPopupTemplate.$inject = [
    '$templateCache'
  ];

  function loadPopupTemplate($templateCache) {
    $templateCache.put("template/popover/popover-html.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\" ng-bind-html=\"unsafeContent\" style=\"word-wrap: break-word\">    </div>\n" +
      "  </div>\n" +
      "</div>\n");
  }
}());
