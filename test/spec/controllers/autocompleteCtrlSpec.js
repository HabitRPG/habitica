'use strict';

describe("Autocomplete controller", function() {
  var scope, ctrl, user, $rootScope, $controller;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, _$controller_){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();
      scope.group = {}
      scope.group.chat = [];

      $controller = _$controller_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('AutocompleteCtrl', {$scope: scope});
    });
  });

  describe("clearUserList", function() {
    it('calling the function clears the list of usernames and responses', function() {
      scope.response.push("blah");
      scope.usernames.push("blub");

      scope.clearUserlist();
      expect(scope.response).to.be.empty;
      expect(scope.usernames).to.be.empty;
    });

    it('the function is called upon initialization of the controller', function() {
      scope.response.push("blah");
      scope.response.push("blub");
      ctrl = $controller('AutocompleteCtrl', {$scope: scope});

      expect(scope.response).to.be.empty;
      expect(scope.usernames).to.be.empty;
    });
  })

  describe("filterUser", function() {
    it('filters with undefined query (not loaded yet) and returns false (so it will not be rendered)', function() {
        expect(scope.filterUser({user: "boo"})).to.be.eq(false);
    });

    it('filters with null query (no typing yet) and returns false (so it will not be rendered)', function() {
      scope.query = null
      expect(scope.filterUser({user: "boo"})).to.be.eq(false);
    });

    it('filters with empty prefix and returns true', function() {
      scope.query = {text: ""};
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
    });

    it('filters with prefix element and returns true', function() {
      scope.query = {text: "pre"}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
    });

    it('filters with prefix element of a different case and returns true', function() {
      scope.query = {text: "pre"}
      expect(scope.filterUser({user: "Prefix"})).to.be.eq(true);
    });

    it('filters with nonprefix element and returns false', function() {
      scope.query = {text: "noprefix"}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(false);
    });

    it('filters out system messages (messages without username)', function() {
      scope.query = {text: "myquery"}
      expect(scope.filterUser({uuid: "system"})).to.be.eq(false);
    });
  });

  describe("performCompletion", function() {
    it('triggers autoComplete', function() {
      scope.autoComplete = sandbox.spy();

      var msg = {user: "boo"}; // scope.autoComplete only cares about user
      scope.query = {text: "b"};
      scope.performCompletion(msg);

      expect(scope.query).to.be.eq(null);
      expect(scope.autoComplete.callCount).to.be.eq(1);
      expect(scope.autoComplete).to.have.been.calledWith(msg);
    });
  });

  describe("addNewUser", function() {
    it('a new message from a new user will modify the usernames', function() {
      expect(scope.response).to.be.empty;
      expect(scope.usernames).to.be.empty;

      var msg = {user: "boo"};
      scope.addNewUser(msg);
      expect(scope.response[0]).to.be.eq(msg);
      expect(scope.usernames[0]).to.be.eq("boo");
    });
  });

  describe("chatChanged", function() {
    it('if a new chat arrives, the new user name is extracted', function() {
      var chatChanged = sandbox.spy(scope, 'chatChanged');
      scope.$watch('group.chat',scope.chatChanged); // reinstantiate watch so spy works

      scope.$digest(); // trigger watch
      scope.group.chat.push({msg: "new chat", user: "boo"});
      expect(chatChanged.callCount).to.be.eq(1);
    });
  });
});
