angular.module('habitrpg')
  .filter('conditionalOrderBy', ['$filter', function($filter) {
    return function (array, predicate, sortPredicate, reverseOrder) {
      if (predicate) {
        return $filter('orderBy')(array, sortPredicate, reverseOrder);
      }
      return array;
    };
  }])
  .filter('filterByTaskInfo', ['$filter', function($filter) {
    return function (tasks, term) {
      if (!tasks) return;

      if (!angular.isString(term) || term.legth === 0) {
        return tasks;
      }

      term = new RegExp(term, 'i');

      var result = [];

      for (var i = 0; i < tasks.length; i++) {
        var checklist = tasks[i].checklist;
        if (term.test(tasks[i].text) || term.test(tasks[i].notes)) {
          result.push(tasks[i]);
        } else if (checklist) {
          var found = _.find(checklist, function(box) { return term.test(box.text); });
          if (found) { result.push(tasks[i]) }
        }
      }

      return result;
    };
  }]);
