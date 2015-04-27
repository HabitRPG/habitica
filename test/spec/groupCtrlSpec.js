'use strict';

describe('Groups Controller', function() {
  var scope, ctrl, groups, user, guild, party, $rootScope;

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
    it("returns true if group is the user's party", function() {
      party = specHelper.newGroup("test-party");
      party._id = "unique-party-id";
      party.type = 'party';
      party.members = []; // Ensure we wouldn't pass automatically.

      var partyStub = sinon.stub(groups,"party", function() {
        return party;
      });

      expect(scope.isMemberOfGroup(user._id, party)).to.be.ok;
    });

    it('returns true if guild is included in myGuilds call', function(){

      guild = specHelper.newGroup("leaders-user-id");
      guild._id = "unique-guild-id";
      guild.type = 'guild';
      guild.members.push(user._id);

      var myGuilds = sinon.stub(groups,"myGuilds", function() {
        return [guild];
      });

      expect(scope.isMemberOfGroup(user._id, guild)).to.be.ok;
      expect(myGuilds).to.be.called
    });

    it('does not return true if guild is not included in myGuilds call', function(){

      guild = specHelper.newGroup("leaders-user-id");
      guild._id = "unique-guild-id";
      guild.type = 'guild';

      var myGuilds = sinon.stub(groups,"myGuilds", function() {
        return [];
      });

      expect(scope.isMemberOfGroup(user._id, guild)).to.not.be.ok;
      expect(myGuilds).to.be.called
    });
  });
});

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
      expect(scope.response).to.be.empty; // to.be.empty() doesn't work for some reason. This is the same thing
      expect(scope.usernames).to.be.empty;
    });

    it('the function is called upon initialization of the controller', function() {
      scope.response.push("blah");
      scope.response.push("blub");
      ctrl = $controller('AutocompleteCtrl', {$scope: scope});

      expect(scope.response).to.be.empty; // to.be.empty() doesn't work for some reason. This is the same thing
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
      scope.query = {text: ""}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
    });

    it('filters with prefix element and returns true', function() {
      scope.query = {text: "pre"}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
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
      var chatChanged = sinon.spy(scope, 'chatChanged');
      scope.$watch('group.chat',scope.chatChanged); // reinstantiate watch so spy works

      scope.$digest(); // trigger watch
      scope.group.chat.push({msg: "new chat", user: "boo"});
      expect(chatChanged.callCount).to.be.eq(1);
    });
  });  
});
