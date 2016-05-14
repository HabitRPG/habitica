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
    it('is Tasks.editTask', function() {
      inject(function(Tasks) {
        expect(scope.editTask).to.eql(Tasks.editTask);
      });
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
