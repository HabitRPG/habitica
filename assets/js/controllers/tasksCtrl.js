"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User', 'Algos', 'Helpers', 'Notification',
  function($scope, $rootScope, $location, User, Algos, Helpers, Notification) {
    /*FIXME
     */
    $scope.taskLists = [
      {
        header: 'Habits',
        type: 'habit',
        placeHolder: 'New Habit',
        main: true,
        editable: true
      }, {
        header: 'Dailies',
        type: 'daily',
        placeHolder: 'New Daily',
        main: true,
        editable: true
      }, {
        header: 'Todos',
        type: 'todo',
        placeHolder: 'New Todo',
        main: true,
        editable: true
      }, {
        header: 'Reward',
        type: 'reward',
        placeHolder: 'New Reward',
        main: true,
        editable: true
      }
    ];
    $scope.score = function(task, direction) {
      /*save current stats to compute the difference after scoring.
       */

      var oldStats, statsDiff;
      statsDiff = {};
      oldStats = _.clone(User.user.stats);
      Algos.score(User.user, task, direction);
      /*compute the stats change.
       */

      _.each(oldStats, function(value, key) {
        var newValue;
        newValue = User.user.stats[key];
        if (newValue !== value) {
          statsDiff[key] = newValue - value;
        }
      });
      /*notify user if there are changes in stats.
       */

      if (Object.keys(statsDiff).length > 0) {
        Notification.push({
          type: "stats",
          stats: statsDiff
        });
      }
      if (task.type === "reward" && _.isEmpty(statsDiff)) {
        Notification.push({
          type: "text",
          text: "Not enough GP."
        });
      }
      User.log({
        op: "score",
        data: task,
        dir: direction
      });
    };

    $scope.addTask = function(list) {
      var task = window.habitrpgShared.helpers.taskDefaults({text: list.newTask, type: list.type});
      User.user[list.type + "s"].unshift(task);
      // $scope.showedTasks.unshift newTask # FIXME what's thiss?
      User.log({op: "addTask", data: task});
      delete list.newTask;
    };
    /*Add the new task to the actions log
     */

    $scope.clearDoneTodos = function() {};
    $scope.changeCheck = function(task) {
      /* This is calculated post-change, so task.completed=true if they just checked it
       */
      if (task.completed) {
        $scope.score(task, "up");
      } else {
        $scope.score(task, "down");
      }
    };
    /* TODO this should be somewhere else, but fits the html location better here
     */

    $rootScope.revive = function() {
      window.habitrpgShared.algos.revive(User.user);
      User.log({
        op: "revive"
      });
    };
    $scope.remove = function(task) {
      var tasks;
      if (confirm("Are you sure you want to delete this task?") !== true) {
        return;
      }
      tasks = User.user[task.type + "s"];
      User.log({
        op: "delTask",
        data: task
      });
      tasks.splice(tasks.indexOf(task), 1);
    };
    /*
     ------------------------
     Items
     ------------------------
     */

    $scope.$watch("user.items", function() {
      var sorted, updated;
      updated = window.habitrpgShared.items.updateStore(User.user);
      /* Figure out whether we wanna put this in habitrpg-shared
       */

      sorted = [updated.weapon, updated.armor, updated.head, updated.shield, updated.potion, updated.reroll];
      $scope.itemStore = sorted;
    });
    $scope.buy = function(type) {
      var hasEnough;
      hasEnough = window.habitrpgShared.items.buyItem(User.user, type);
      if (hasEnough) {
        User.log({
          op: "buy",
          type: type
        });
        Notification.push({
          type: "text",
          text: "Item bought!"
        });
      } else {
        Notification.push({
          type: "text",
          text: "Not enough GP."
        });
      }
    };


    $scope.clearCompleted = function() {
      User.user.todos = _.reject(User.user.todos, {completed:true});
      User.log({op: 'clear-completed'});
    }

}]);
