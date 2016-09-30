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

  describe('filterByTaskInfo', function () {
    it('returns undefined when no input given', function () {
      expect(filter('filterByTaskInfo')()).to.eql(undefined);
    });

    it('returns all tasks if term is not a string', function () {
      var tasks  = [1, 2, 3];
      expect(filter('filterByTaskInfo')(tasks, undefined)).to.eql(tasks);
      expect(filter('filterByTaskInfo')(tasks, [])).to.eql(tasks);
      expect(filter('filterByTaskInfo')(tasks, new Date())).to.eql(tasks);
    });

    it('returns tasks if term is an empty string', function () {
      var tasks  = [1, 2, 3];
      expect(filter('filterByTaskInfo')(tasks, '')).to.eql(tasks);
    });

    it('filters items by text', function () {
      var tasks = [
        { text: 'foo' },
        { text: 'some text that contains foo' },
        { text: 'some text that should not be matched' }
      ];

      expect(filter('filterByTaskInfo')(tasks, 'foo')).to.eql([tasks[0], tasks[1]]);
    });

    it('filters items by notes', function () {
      var tasks = [
        { text: 'some text', notes: 'foo' },
        { text: 'some text', notes: 'a note that contains foo' },
        { text: 'some text', notes: 'some text' },
        { text: 'some text' }
      ];

      expect(filter('filterByTaskInfo')(tasks, 'foo')).to.eql([tasks[0], tasks[1]]);
    });

    it('filters items by checklists', function () {
      var tasks = [
        { text: 'foo' },
        { text: 'foo', notes: 'bar', checklist: [ {text: "checkListToFind"} ] },
        { text: 'foo', notes: 'bar', checklist: [ {text: "checkListToNotFind"} ] }
      ];

      expect(filter('filterByTaskInfo')(tasks, 'checkListToFind')).to.eql([tasks[1]]);
    });

    it('only includes task once, even with multiple matches in checklist', function() {
      var tasks = [
        {
          text: 'foo', notes: 'bar', checklist: [
            {text: "checkListToFind"},
            {text: "checkListToFind"},
            {text: "checkListToFind"}
          ]
        }
      ];

      expect(filter('filterByTaskInfo')(tasks, 'checkListToFind')).to.eql([tasks[0]]);
    });
  });
});
