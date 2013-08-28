'use strict';

habitrpg.controller('TasksCtrl', function TasksCtrl($scope, $rootScope, $location, filterFilter, User, Algos, Helpers, Notification) {

    $scope.user  = User.user;


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
