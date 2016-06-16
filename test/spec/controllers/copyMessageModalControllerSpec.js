'use strict';

describe("CopyMessageModal controller", function() {
  var scope, ctrl, user, Notification, $rootScope, $controller;

  beforeEach(function() {
    module(function($provide) {
      var mockWindow = {href: '', alert: sandbox.spy(), location: {search: '', pathname: '', href: ''}};

      $provide.value('$window', mockWindow);
    });

    inject(function($rootScope, _$controller_, _Notification_, User){
      user = specHelper.newUser();
      user._id = "unique-user-id";
      user.ops = {
        addTask: sandbox.spy()
      };

      scope = $rootScope.$new();
      scope.$close = sandbox.spy();

      $controller = _$controller_;

      User.setUser(user);

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('CopyMessageModalCtrl', {$scope: scope, User: User});

      Notification = _Notification_;
      Notification.text = sandbox.spy();
    });
  });

  describe("saveTodo", function() {
    it('saves todo', function() {

      scope.text = "A Tavern msg";
      scope.notes = "Some notes";
      var payload = {
        body: {
          text: scope.text,
          type: 'todo',
          notes: scope.notes
        }
      };

      scope.saveTodo();

      user.ops.addTask.should.have.been.calledOnce;
      user.ops.addTask.should.have.been.calledWith(payload);
      Notification.text.should.have.been.calledOnce;
      Notification.text.should.have.been.calledWith(window.env.t('messageAddedAsToDo'));
      scope.$close.should.have.been.calledOnce;
    });
  });
});
