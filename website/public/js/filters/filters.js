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
  .filter('htmlDecode',function(){
    return function(html){
      return $('<div/>').html(html).text();
    }
  })
  .filter('goldRoundThousandsToK', function(){
    return function (gp) {
      return (gp > 999999999) ? (gp / Math.pow(10, 9)).toFixed(1) + "b" :
        (gp > 999999) ? (gp / Math.pow(10, 6)).toFixed(1) + "m" :
        (gp > 999) ? (gp / Math.pow(10, 3)).toFixed(1) + "k" : gp;
    }
  })
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

      var result = [], i;

      for (i = 0; i < input.length; i++) {
        if (term.test(input[i].text) || term.test(input[i].notes)) {
            result.push(input[i]);
        }
      }

      return result;
    };
  }]);
