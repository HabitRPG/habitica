'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('taskList', taskList);

  taskList.$inject = [
    '$rootScope',
    'Shared',
  ];

  function taskList($rootScope, Shared) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/task-list.html',
      transclude: true,
      scope: {
       taskList: '=list',
       list: '=listDetails',
       obj: '=object',
       user: "=",
      },
      controller: 'TasksCtrl',
      link: function($scope, element, attrs) {
        console.log($scope.score);

      }
    }
  }
}());
