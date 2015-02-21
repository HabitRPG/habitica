'use strict';

describe('Tasks Controller', function() {
  var scope, ctrl;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('TasksCtrl', {$scope: scope});
  }));

  describe('$scope.parseTask()', function() {
    it('Processes a simple habit correctly', function() {
      var listDef = {type: 'habit'};
      var task = scope.parseTask(listDef, 'Just a name. No other info.');
      expect(task.to.eql({
        text: 'Just a name. No other info.',
        type: 'habit'
      }));
    });

    it('Processes a simple daily correctly', function() {
      var listDef = {type: 'daily'};
      var task = scope.parseTask(listDef, 'Just a name. No other info.');
      expect(task.to.eql({
        text: 'Just a name. No other info.',
        type: 'daily'
      }));
    });

    it('Processes a simple to-do correctly', function() {
      var listDef = {type: 'todo'};
      var task = scope.parseTask(listDef, 'Just a name. No other info.');
      expect(task.to.eql({
        text: 'Just a name. No other info.',
        type: 'todo'
      }));
    });

    it('Processes a simple reward correctly', function() {
      var listDef = {type: 'reward'};
      var task = scope.parseTask(listDef, 'Just a name. No other info.');
      expect(task.to.eql({
        text: 'Just a name. No other info.',
        type: 'reward'
      }));
    });
  });
});
