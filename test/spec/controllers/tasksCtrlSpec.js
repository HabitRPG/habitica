'use strict';

describe('Tasks Controller', function() {
  var $rootScope, shared, scope, user, User, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    User = {
      user: user
    };

    User.deleteTask = sandbox.stub();
    User.user.ops = {
      deleteTask:  sandbox.stub(),
    };
    module(function($provide) {
      $provide.value('User', User);
      $provide.value('Guide', {});
    });

    inject(function($rootScope, $controller, Shared){

      scope = $rootScope.$new();
      shared = Shared;
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('TasksCtrl', {$scope: scope, User: User});

    });
  });

  describe('editTask', function() {

    var task;

    beforeEach(function(){
      task = specHelper.newTask();
    });

    it('toggles the _editing property', function() {
      scope.editTask(task, user);
      expect(task._editing).to.eql(true);
    });

    it('sets _tags to true by default', function() {
      scope.editTask(task, user);

      expect(task._tags).to.eql(true);
    });

    it('sets _tags to false if preference for collapsed tags is turned on', function() {
      user.preferences.tagsCollapsed = true;
      scope.editTask(task, user);

      expect(task._tags).to.eql(false);
    });

    it('sets _advanced to true by default', function(){
      user.preferences.advancedCollapsed = true;
      scope.editTask(task, user);

      expect(task._advanced).to.eql(false);
    });

    it('sets _advanced to false if preference for collapsed advance menu is turned on', function() {
      user.preferences.advancedCollapsed = false;
      scope.editTask(task, user);

      expect(task._advanced).to.eql(true);
    });


  });

  describe('cancelEdit', function() {

    var task;

    beforeEach(function(){
      task = specHelper.newTask();
    });

    it('resets the task text', function() {
      let originalText = task.text;
      scope.editTask(task, user);
      task.text = 'test';
      scope.cancelTaskEdit(task)
      expect(task.text).to.be.eql(originalText);
    });

    it('resets the task notes', function() {
      let originalNotes = task.notes;
      scope.editTask(task, user);
      task.notes = 'test';
      scope.cancelTaskEdit(task)
      expect(task.notes).to.be.eql(originalNotes);
    });

    it('resets the task alias', function() {
      task.alias = 'alias';
      let originalAlias = task.alias;
      scope.editTask(task, user);
      task.alias = 'test';
      scope.cancelTaskEdit(task)
      expect(task.alias).to.be.eql(originalAlias);
    });

    it('resets the task priority', function() {
      let originalPriority = task.priority;
      scope.editTask(task, user);
      task.priority = 'test';
      scope.cancelTaskEdit(task)
      expect(task.priority).to.be.eql(originalPriority);
    });

  });

  describe('removeTask', function() {
    var task;

    beforeEach(function() {
      sandbox.stub(window, 'confirm');
      task = specHelper.newTodo();
    });

    it('asks user to confirm deletion', function() {
      scope.removeTask(task);
      expect(window.confirm).to.be.calledOnce;
    });

    it('does not remove task if not confirmed', function() {
      window.confirm.returns(false);
      scope.removeTask(task);
      expect(User.deleteTask).to.not.be.called;
    });

    it('removes task', function() {
      window.confirm.returns(true);
      scope.removeTask(task);
      expect(User.deleteTask).to.be.calledOnce;
    });
  });

  describe('watch to updateStore', function() {
    it('updates itemStore when user gear changes', function() {
      sinon.stub(shared, 'updateStore').returns({item: true});
      user.items.gear.owned.foo = true;

      scope.$digest();
      expect(scope.itemStore).to.eql({item: true});
    });
  });
});
