angular.module('habitrpg')
  .filter('conditionalOrderBy', ['$filter', function($filter) {
    return function (array, predicate, sortPredicate, reverseOrder) {
      if (predicate) {
        return $filter('orderBy')(array, sortPredicate, reverseOrder);
      }
      return array;
    };
  }])
  .filter('filterByTextAndNotes', ['$filter', function($filter) {
    return function (input, term) {
      if (!input) return;

      if (!angular.isString(term) || term.legth === 0) {
        return input;
      }

      term = new RegExp(term, 'i');

      var result = [];

      for (var i = 0; i < input.length; i++) {
        if (term.test(input[i].text) || term.test(input[i].notes)) {
          result.push(input[i]);
        }else if (input[i].checklist) {
          var checkListLen = input[i].checklist.length;
          for (var j = 0; j < checkListLen; j++) {
            if ( term.test(input[i].checklist[j].text) ) {
              result.push(input[i]);
            }
          }
        }
      }

      return result;
    };
  }]);
