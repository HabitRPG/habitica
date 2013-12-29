angular.module('habitrpg')
  .filter('gold', function () {
    return function (gp) {
      return Math.floor(gp);
    }
  })
  .filter('silver', function () {
    return function (gp) {
      return Math.floor((gp - Math.floor(gp))*100);
    }
  })
  .filter('completedFilter', function(){
    return function(tasks,_showCompleted) {
      if (tasks[0].type != 'todo') return tasks;
      return _.where(tasks, {completed:!!_showCompleted});
    }
  })