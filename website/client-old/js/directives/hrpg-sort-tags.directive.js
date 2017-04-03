'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('hrpgSortTags', hrpgSortTags);

  hrpgSortTags.$inject = [
    'User'
  ];

  function hrpgSortTags(User) {
    return function($scope, element, attrs, ngModel) {
      $(element).sortable({
        start: function (event, ui) {
          ui.item.data('startIndex', ui.item.index());
        },
        stop: function (event, ui) {
          User.sortTag({
            query: {
              from: ui.item.data('startIndex'),
              to: ui.item.index()
            }
          });
        }
      });
    }
  }
}());
