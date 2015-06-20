'use strict';

describe('Task Ordering Filters', function() {
  var filter, orderBySpy;

  beforeEach(function() {
    orderBySpy = sandbox.spy();

    module(function($provide) {
      $provide.value('orderByFilter', orderBySpy);
    });
    inject(function($rootScope, $filter) {
      filter  = $filter;
    });
  });

  describe('conditionalOrderBy', function() {
    describe('when the predicate is true', function() {
      it('delegates the arguments to the orderBy filter', function() {
        filter('conditionalOrderBy')('array', true, 'sortPredicate', 'reverseOrder');
        expect(orderBySpy).to.have.been.calledWith('array','sortPredicate','reverseOrder');
      });
    });

    describe('when the predicate is false', function() {
      it('returns the initial array', function() {
        expect(filter('conditionalOrderBy')([1,2,3], false)).to.eql([1,2,3]);
      });
    });
  });

  describe('filterByTextAndNotes', function () {
    it('returns undefined when no input given', function () {
      expect(filter('filterByTextAndNotes')()).to.eql(undefined);
    });

    it('returns input if term is not a string', function () {
      var input  = [1, 2, 3];
      expect(filter('filterByTextAndNotes')(input, '')).to.eql(input);
      expect(filter('filterByTextAndNotes')(input, undefined)).to.eql(input);
      expect(filter('filterByTextAndNotes')(input, [])).to.eql(input);
      expect(filter('filterByTextAndNotes')(input, new Date())).to.eql(input);
    });

    it('filters items by notes and text', function () {
      var tasks = [
        { text: 'foo' },
        { text: 'foo', notes: 'bar' }
      ];

      expect(filter('filterByTextAndNotes')(tasks, 'bar')).to.eql([tasks[1]]);
      expect(filter('filterByTextAndNotes')(tasks, 'foo')).to.eql([tasks[0], tasks[1]]);
    });
  });
});
