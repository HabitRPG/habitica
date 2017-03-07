'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('taskList', taskList);

  taskList.$inject = [
    '$state',
    'User',
    '$rootScope',
  ];

  function taskList($state, User, $rootScope) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/task-list.html',
      transclude: true,
      scope: true,
      // scope: {
      //  taskList: '=list',
      //  list: '=listDetails',
      //  obj: '=object',
      //  user: "=",
      // },
      link: function($scope, element, attrs) {
        // @TODO: The use of scope with tasks is incorrect. We need to fix all task ctrls to use directives/services
        // $scope.obj = {};
        function setObj (obj, force) {
          if (!force && ($scope.obj || $scope.obj !== {} || !obj)) return;
          $scope.obj = obj;
          setUpGroupedList();
          setUpTaskWatch();
        }

        $rootScope.$on('obj-updated', function (event, obj) {
          setObj(obj, true);
        });

        function setUpGroupedList () {
          if (!$scope.obj) return;
          $scope.groupedList = {};
          ['habit', 'daily', 'todo', 'reward'].forEach(function (listType) {
            groupTasksByChallenge($scope.obj[listType + 's'], listType);
          });
        }
        setUpGroupedList();

        function groupTasksByChallenge (taskList, type) {
          $scope.groupedList[type] = _.groupBy(taskList, 'challenge.shortName');
        };

        function setUpTaskWatch () {
          if (!$scope.obj) return;
          $scope.$watch(function () { return $scope.obj.tasksOrder; }, function () {
            setUpGroupedList();
          }, true);
        }
        setUpTaskWatch();

        $scope.getTaskList = function (list, taskList, obj) {
          setObj(obj);
          if (!$scope.obj) return [];
          if (taskList) return taskList;
          return $scope.obj[list.type+'s'];
        };

        $scope.showNormalList = function () {
          return !$state.includes("options.social.challenges") && !User.user.preferences.tasks.groupByChallenge;
        };

        $scope.showChallengeList = function () {
          return $state.includes("options.social.challenges");
        };

        $scope.showDoubleTaskCounter = function (task, obj) {
          var objectIsGroup = obj.type && (obj.type === 'guild' || obj.type === 'party');
          var objectIsChallenge = $state.includes("options.social.challenges");
          return !objectIsGroup && !objectIsChallenge && task.up && task.down;
        };

        $scope.showSingleTaskCounter = function (task, obj) {
          var objectIsGroup = obj.type && (obj.type === 'guild' || obj.type === 'party');
          var objectIsChallenge = $state.includes("options.social.challenges");
          return !objectIsGroup && !objectIsChallenge && task.type === "habit" && (!task.up || !task.down);
        };
      }
    }
  }
}());