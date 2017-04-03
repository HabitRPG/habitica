'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupTasks', hrpgSortTags);

  hrpgSortTags.$inject = [
  ];

  function hrpgSortTags() {

    return {
      scope: true,
      templateUrl: 'partials/groups.tasks.html',
      controller: 'GroupTasksCtrl',
      link: function($scope, element, attrs, ngModel) {
      },
    };
  }
}());
