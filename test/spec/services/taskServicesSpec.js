'use strict';

describe('Tasks Service', function() {
  var rootScope, tasks, user;

  beforeEach(function() {

    module(function($provide) {
      user = specHelper.newUser();
      $provide.value('User', {user: user});
    });

    inject(function(_$rootScope_, Tasks, User) {
      rootScope = _$rootScope_;
      rootScope.charts = {};
      tasks = Tasks;
    });
  });

  describe('editTask', function() {

    var task;

    beforeEach(function(){
      task = { id: 'task-id' }; // @TODO: replace with task factory
    });

    it('toggles the _editing property', function() {
      tasks.editTask(task);
      expect(task._editing).to.eql(true);
      tasks.editTask(task);
      expect(task._editing).to.eql(false);
    });

    it('sets _tags to true by default', function() {
      tasks.editTask(task);

      expect(task._tags).to.eql(true);
    });

    it('sets _tags to false if preference for collapsed tags is turned on', function() {
      user.preferences.tagsCollapsed = true;
      tasks.editTask(task);

      expect(task._tags).to.eql(false);
    });

    it('sets _advanced to true by default', function(){
      user.preferences.advancedCollapsed = true;
      tasks.editTask(task);

      expect(task._advanced).to.eql(false);
    });

    it('sets _advanced to false if preference for collapsed advance menu is turned on', function() {
      user.preferences.advancedCollapsed = false;
      tasks.editTask(task);

      expect(task._advanced).to.eql(true);
    });

    it('closes task chart if it exists', function() {
      rootScope.charts[task.id] = true;

      tasks.editTask(task);
      expect(rootScope.charts[task.id]).to.eql(false);
    });
  });
});
