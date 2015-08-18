'use strict';

describe('Groups Controller', function() {
  var scope, ctrl, groups, user, guild, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Groups){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('GroupsCtrl', {$scope: scope, User: {user: user}});

      groups = Groups;
    });
  });

  describe("isMemberOfGroup", function() {
    it("returns true if group is the user's party retrieved from groups service", function() {
      var party = specHelper.newGroup({
        _id: "unique-party-id",
        type: 'party',
        members: ['leader-id'] // Ensure we wouldn't pass automatically.
      });

      var partyStub = sandbox.stub(groups,"party", function() {
        return party;
      });

      expect(scope.isMemberOfGroup(user._id, party)).to.be.ok;
    });

    it('returns true if guild is included in myGuilds call', function(){

      var guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: [user._id]
      });

      var myGuilds = sandbox.stub(groups,"myGuilds", function() {
        return [guild];
      });

      expect(scope.isMemberOfGroup(user._id, guild)).to.be.ok;
      expect(myGuilds).to.be.called;
    });

    it('does not return true if guild is not included in myGuilds call', function(){

      var guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: ['not-user-id']
      });

      var myGuilds = sandbox.stub(groups,"myGuilds", function() {
        return [];
      });

      expect(scope.isMemberOfGroup(user._id, guild)).to.not.be.ok;
      expect(myGuilds).to.be.calledOnce;
    });
  });
});

describe("CopyMessageModal controller", function() {
  var scope, ctrl, user, Notification, $rootScope, $controller;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, _$controller_, _Notification_){
      user = specHelper.newUser();
      user._id = "unique-user-id";
      user.ops = {
        addTask: sandbox.spy()
      };

      scope = $rootScope.$new();
      scope.$close = sandbox.spy();

      $controller = _$controller_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('CopyMessageModalCtrl', {$scope: scope, User: {user: user}});

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
