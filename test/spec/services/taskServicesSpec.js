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

    it('opens the edit menu if it is not already open', function() {
      tasks.editTask(task);

      expect(task._editing).to.eql(true);
    });

    it('closes the edit menu if it is not already open', function() {
      task._editing = true;
      tasks.editTask(task);

      expect(task._editing).to.eql(false);
    });

    it('shows tags by default', function() {
      tasks.editTask(task);

      expect(task._tags).to.eql(true);
    });

    it('does not show tags if tagsCollapsed preference is enabled', function() {
      user.preferences.tagsCollapsed = true;
      tasks.editTask(task);

      expect(task._tags).to.eql(false);
    });

    it('closes the edit menu if it is not already open', function() {
      task._editing = true;
      tasks.editTask(task);

      expect(task._editing).to.eql(false);
    });

    it('does not open open advanced options automatically if user preference is set to collapsed', function(){
      user.preferences.advancedCollapsed = true;
      tasks.editTask(task);

      expect(task._advanced).to.eql(false);
    });

    it('does open open advanced options automatically if user preference is set to not collapsed', function(){
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
