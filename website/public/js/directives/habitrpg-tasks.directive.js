'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('habitrpgTasks', habitrpgTasks);

  habitrpgTasks.$inject = [
    '$rootScope',
    'User'
  ];

  function habitrpgTasks($rootScope, User) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/habitrpg-tasks.html',
      //transclude: true,
      //scope: {
      //  main: '@', // true if it's the user's main list
      //  obj: '='
      //},
      link: function($scope, element, attrs) {
        // $scope.obj needs to come from controllers, so we can pass by ref
        $scope.main = attrs.main;
        $scope.modal = attrs.modal;
        var dailiesView;
        if(User.user.preferences.dailyDueDefaultView) {
          dailiesView = "remaining";
        } else {
          dailiesView = "all";
        }
        $rootScope.lists = [
          {
            header: window.env.t('habits'),
            type: 'habit',
            placeHolder: window.env.t('newHabit'),
            placeHolderBulk: window.env.t('newHabitBulk'),
            view: "all"
          }, {
            header: window.env.t('dailies'),
            type: 'daily',
            placeHolder: window.env.t('newDaily'),
            placeHolderBulk: window.env.t('newDailyBulk'),
            view: dailiesView
          }, {
            header: window.env.t('todos'),
            type: 'todo',
            placeHolder: window.env.t('newTodo'),
            placeHolderBulk: window.env.t('newTodoBulk'),
            view: "remaining"
          }, {
            header: window.env.t('rewards'),
            type: 'reward',
            placeHolder: window.env.t('newReward'),
            placeHolderBulk: window.env.t('newRewardBulk'),
            view: "all"
          }
        ];

      }
    }
  }
}());
