'use strict';

describe('Tasks Controller', function() {
  var $rootScope, scope, user, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    module(function($provide) {
      $provide.value('User', {user: user});
      $provide.value('Guide', {});
    });

    inject(function($rootScope, $controller){

      scope = $rootScope.$new();

      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('TasksCtrl', {$scope: scope, User: {user: user}});

    });
  });

  describe('editTask', function() {
    it('calls Tasks.editTask', function() {
      inject(function(Tasks) {
        sinon.stub(Tasks, 'editTask');
        var task = {
          id: 'task-id',
          type: 'todo'
        };

        scope.editTask(task);
        expect(Tasks.editTask).to.be.calledOnce;
        expect(Tasks.editTask).to.be.calledWith(task);
      });
    });
  });
});
