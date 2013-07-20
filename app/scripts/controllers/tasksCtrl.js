'use strict';

habitrpg.controller('TasksCtrl', function TasksCtrl($scope, $rootScope, $location, filterFilter, User, Algos, Helpers, Notification) {

    $scope.user  = User.user;

    $scope.$watch('User.user.stats.gp', function() {
        $scope.money_gold = Math.round(User.user.stats.gp)
    })

    $scope.taskTypeTitle = function () {
//        show title according to the location
        switch ($location.path().split('/')[1]) {
            case 'habit':
                return 'Habits';
            case 'daily':
                return 'Dailies';
            case 'todo':
                return 'Todos';
            case 'reward':
                return 'Rewards';
            default :
                return "";
        }
    };

    $scope.taskTypeTitleSingular = function () {
//        show title according to the location, singular form
        return $scope.taskTypeTitle().slice(0,-1);
    };

    $scope.taskType = function () {
        return $location.path().split('/')[1]
    };

    $scope.tasks = function () {
        //return task array based on our location i.e. /habit will return user.habits[]
        var tasks = []
        //return User.user[$scope.taskType() + 's']

        _.each(User.user['habits'], function(el, index) {
            tasks.push(el)
        })

        _.each(User.user['dailys'], function(el, index) {
            tasks.push(el)
        })

        _.each(User.user['todos'], function(el, index) {
            tasks.push(el)
        })

        _.each(User.user['rewards'], function(el, index) {
            tasks.push(el)
        })

        return tasks
    };

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
           // Notification.push({type: 'stats', stats: statsDiff});
        }
        User.log({op: 'score', task: task, dir: direction});
    };

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

    $scope.addTask = function (type) {
        var task = null

        if (type == 'habit') {
            task = $scope.newTaskHabit
        }else if (type == 'daily') {
            task = $scope.newTaskDailies
        }else if (type == 'todo') {
            task = $scope.newTaskTodo
        }else if (type == 'reward') {
            task = $scope.newTaskReward
        }

        if (!task.length) {
            return;
        }

        var defaults = {
                text: task,
                type: type,
                value: type == 'reward' ? 20 : 0
            },
            extra = {};

        switch (type) {
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
        User.log({op: 'addTask', task: newTask});
        $scope.tasks().unshift(newTask);
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

    $scope.editTask = function(task) {
        if (!task.editing) {
            task.editing = true
                if (typeof task.tags == 'undefined') {
                    task.tags = {}
                }
        }else{
            task.editing = false
        }
    }

    $scope.save = function(task) {

        var ops = ([
            {op: 'set', path: "tasks." + task.id + ".text", value: task.text},
            {op: 'set', path: "tasks." + task.id + ".notes", value: task.notes},
            {op: 'set', path: "tasks." + task.id + ".up", value: task.up},
            {op: 'set', path: "tasks." + task.id + ".down", value: task.down},
            {op: 'set', path: "tasks." + task.id + ".priority", value: task.priority},
            {op: 'set', path: "tasks." + task.id + ".date", value: task.date},
            {op: 'set', path: "tasks." + task.id + ".price", value: task.price},
        ])

        _.each(task.tags, function(el, key, list) {
            ops.push({op: 'set', path: "tasks." + task.id + ".tags." + key, value: el})
        })

        _.each(task.repeat, function(el, key, list) {
            ops.push({op: 'set', path: "tasks." + task.id + ".repeat." + key, value: el})
        })

        User.log(ops)
       
       task.editing = false

    }

    $scope.showAdvancedOptions = function(task) {
        if (!task.advanced) {
            task.advanced = true
        }else{
            task.advanced = false
        }
    }

    $scope.setPriority = function(task, priority) {
        task.priority = priority
    }

    $scope.getPriority = function(task, priority) {
        if (task.priority == priority) {
            return true;
        }else{
            return false;
        }
    }

    $scope.getRepeat = function(task, repeat) {
        var enabled = '';
        _.each(task.repeat, function(el, key, list) {
            if (key == repeat && el == true) {
                enabled = true
            }
        })

        if (enabled) {
            return true
        }else{
            return false
        }
    }

    $scope.setRepeat = function(task, repeat) {

        if (typeof task.repeat == 'undefined') {
            var obj = {}
            obj[repeat] = true;

            task.repeat = {}
            task.repeat = obj
            return true
        }


        if (!task.repeat[repeat]) {
            task.repeat[repeat] = true
        }else{
            task.repeat[repeat] = false
        }

    }

    $scope.addTag = function(task, tag) {
        var obj = {}
        obj[tag] = true
        task.tags.push(obj)
    }

    $scope.toggleTag = function(task, tag) {
        var obj = {}
        if (typeof task.tags != 'undefined') {
            if (!task.tags[tag]) {
                task.tags[tag] = false;
            }else{
                task.tags[tag] = true
            }
        }else{
             task.tags = {}
             task.tags[tag] = true
        }
    }


});
