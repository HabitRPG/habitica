'use strict';

habitrpg.controller('TaskDetailsCtrl', function TaskDetailsCtrl($scope, $rootScope, $location, User) {

    $scope.task = $rootScope.selectedTask;
    $scope.editing = false;
    $scope.editedTask = null;

    $scope.goBack = function () {
        $rootScope.selectedTask = null;
        $location.path('/' + $scope.task.type);
    };

    $scope.edit = function () {
        $scope.originalTask = _.clone($scope.task); // TODO deep clone?;
        $scope.editedTask = $scope.task;
        $scope.editing = true;
    };

    $scope.save = function () {
        var task = $scope.task;
        User.log([
            {op: 'set', path: "tasks." + task.id + ".text", value: task.text},
            {op: 'set', path: "tasks." + task.id + ".notes", value: task.notes}
        ]);
        $rootScope.selectedTask = null;
        $location.path('/' + $scope.task.type);
        $scope.editing = false;
    };

    $scope.cancel = function () {
        // reset $scope.task to $scope.originalTask
        for (var key in $scope.task) {
            $scope.task[key] = $scope.originalTask[key];
        }
        $scope.originalTask = null;
        $scope.editedTask = null;
        $scope.editing = false;
    };

    $scope.delete = function () {
        var task = $scope.task;
        var tasks = User.user[task.type+'s'];
        User.log({op: 'delTask', task: task});
        $scope.goBack();
        delete tasks.splice(tasks.indexOf(task),1);
    };


});
