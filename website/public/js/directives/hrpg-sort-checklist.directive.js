'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('hrpgSortChecklist', hrpgSortChecklist);

  hrpgSortChecklist.$inject = [
    'User'
  ];

  function hrpgSortChecklist(User) {
    return function($scope, element, attrs, ngModel) {
      $(element).sortable({
        axis: "y",
        distance: 5,
        start: function (event, ui) {
          ui.item.data('startIndex', ui.item.index());
        },
        stop: function (event, ui) {
          var task = angular.element(ui.item[0]).scope().task;
          var startIndex = ui.item.data('startIndex');
          $scope.swapChecklistItems(
            task,
            startIndex,
            ui.item.index()
          );
        }
      });
    }
  }
}());
