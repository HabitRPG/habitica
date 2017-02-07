'use strict';

angular.module('habitrpg')
.factory('Undo', ['$rootScope', '$http', 'Tasks',
  function undo($rootScope, $http, Tasks) {
    var undoApi = {};

    undoApi.history = [];

    undoApi.addAction = function (action, data) {
      undoApi.history.push({action: action, data: data});
    };

    undoApi.undoAction = function () {
      var pop = undoApi.history.pop();
      if (!pop) return;
  
      // @TODO: We need to add a pop interface for each action
      if (pop.action === 'scoreTask') {
        var direction = pop.data.direction;

        if (direction === "up")  {
          direction = "down";
        } else {
          direction = "up";
        }

        Tasks.scoreTask(pop.data.task, direction, pop.data.user)
          .then(function (res) {
            Tasks.handleScoreTaskResponse(res, pop.data.user);
          });
      }

    };

    $rootScope.$on('keypress', function (e, a, key) {
      console.log(key)
        // $scope.$apply(function () {
        //     $scope.key = key;
        // });
        /// 90
    })

    return undoApi;
  }]);
