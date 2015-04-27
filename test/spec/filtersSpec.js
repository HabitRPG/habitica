'use strict';

describe('Custom Filters', function() {
  var filter
    , orderBySpy = sinon.spy();

  beforeEach(function() {
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
});
