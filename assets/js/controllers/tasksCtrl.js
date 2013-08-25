'use strict';

habitrpg.controller('TasksCtrl',
  ['$scope', '$rootScope', '$location', 'filterFilter', 'User', 'Algos', 'Helpers', 'Notification',
  function($scope, $rootScope, $location, filterFilter, User, Algos, Helpers, Notification) {

    $scope.user = User.user;

    $scope.taskTypeTitleSingular = function () {
//        show title according to the location, singular form
        return $rootScope.taskContext.type.charAt(0).toUpperCase() + $rootScope.taskContext.type.slice(1);
    };

    $scope.taskType = function () {
        return $location.path().split('/')[1]
    };

    $scope.tasks = function () {
        //return task array based on our location i.e. /habit will return user.habits[]
        return User.user[$scope.taskType() + 's'];
    };

    $scope.showedTasks = []

    $scope.taskFilter = function (task) {
        return ($location.path() == '/todo') ? !task.completed :
            ($location.path() == '/todo/completed') ? task.completed :
                true;
    };

    $scope.score = function (task, direction) {
        //save current stats to compute the difference after scoring.
        var statsDiff = {};
        var oldStats = _.clone(User.user.stats);

        Algos.score(User.user, task, direction);

        //compute the stats change.
        _.each(oldStats, function (value, key) {
            var newValue = User.user.stats[key];
            if (newValue !== value) {
                statsDiff[key] = newValue - value;
            }
        });
        //notify user if there are changes in stats.
        if (Object.keys(statsDiff).length > 0) {
            Notification.push({type: 'stats', stats: statsDiff});
        }

        if (task.type == 'reward' && _.isEmpty(statsDiff)) {
            Notification.push({type: 'text', text: 'Not enough GP.'});
        }

        User.log({op: 'score', data: task, dir: direction});
    };

    $scope.notDue = function(task) {
      if (task.type == 'daily') {
        return !window.habitrpgShared.helpers.shouldDo(moment(), task.repeat);
      } else {
        return false
      }
    }

    $scope.getClass = function(value) {

        var out = ''
        if (value < -20)
            out += ' color-worst'
        else if (value < -10)
            out += ' color-worse'
        else if (value < -1)
            out += ' color-bad'
        else if (value < 1)
            out += ' color-neutral'
        else if (value < 5)
            out += ' color-good'
        else if (value < 10)
            out += ' color-better'
        else
            out += ' color-best'
        return out
    }

    $scope.addTask = function () {
        if (!$scope.newTask.length) {
            return;
        }

        var defaults = {
                text: $scope.newTask,
                type: $scope.taskType(),
                value: $scope.taskType() == 'reward' ? 20 : 0
            },
            extra = {};

        switch ($scope.taskType()) {
            case 'habit':
                extra = {up: true, down: true};
                break;
            case 'daily':
            case 'todo':
                extra = {completed: false};
                break;
        }


        var newTask = _.defaults(extra, defaults);
        newTask.id = Helpers.uuid();
        User.user[newTask.type + 's'].unshift(newTask)
        $scope.showedTasks.unshift(newTask)
        User.log({op: 'addTask', data: newTask});
        $scope.newTask = '';
        //Add the new task to the actions log

    };

    $scope.clearDoneTodos = function () {
        //We can't alter $scope.user.tasks here. We have to invoke API call.
        //To be implemented
    };

    $scope.selectTask = function (task) {
        $rootScope.selectedTask = task;
        $location.path('/tasks/' + task.id)
    }

    $scope.changeCheck = function (task) {
        // This is calculated post-change, so task.completed=true if they just checked it
        if (task.completed) {
            $scope.score(task, 'up')
        } else {
            $scope.score(task, 'down')
        }
    }

    $('.taskWell').css('height', $(window).height() - 61)

    // TODO this should be somewhere else, but fits the html location better here
    $rootScope.revive = function() {
        window.habitrpgShared.algos.revive(User.user);
        User.log({op:'revive'});
    }

    var counter = 0;


    /**
     * ------------------------
     * Items
     * ------------------------
     */

    $scope.$watch('user.items', function(){
      $scope.itemStore = window.habitrpgShared.items.updateStore($scope.user);
    });

    $scope.buy = function(type) {
      var hasEnough = window.habitrpgShared.items.buyItem($scope.user, type);
      if (hasEnough) {
        User.log({op:'buy', type:type});
        Notification.push({type:'text', text:"Item bought!"})
      } else {
        Notification.push({type:'text', text:"Not enough GP."})
      }
    }
   
    /*
    $scope.loadMore = function() {

        var length = $scope.showedTasks.length
        if (typeof $scope.tasks() != 'undefined') {
            for (var i = length; i < length+7; i++) {
                if (typeof $scope.tasks()[i] != 'undefined') {
                    $scope.showedTasks.push($scope.tasks()[i]);
                }
            }
        }


    };

    $scope.loadMore()

    */

  }
]);
