'use strict';

describe('Tasks Controller', function() {
  var $rootScope, shared, scope, user, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    module(function($provide) {
      $provide.value('User', {user: user});
      $provide.value('Guide', {});
    });

    inject(function($rootScope, $controller, Shared){

      scope = $rootScope.$new();
      shared = Shared;
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

  describe('watch to updateStore', function() {
    it('updates itemStore when user gear changes', function() {
      sinon.stub(shared, 'updateStore').returns({item: true});
      user.items.gear.owned.foo = true;

      scope.$digest();
      expect(scope.itemStore).to.eql({item: true});
    });
  });
});
