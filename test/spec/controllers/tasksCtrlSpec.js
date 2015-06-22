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
    it('is Tasks.editTask', function() {
      inject(function(Tasks) {
        expect(scope.editTask).to.eql(Tasks.editTask);
      });
    });
  });
});
