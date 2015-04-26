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

      $controller = _$controller_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('AutocompleteCtrl', {$scope: scope});
    });
  });

  describe("chatChanged", function() {
    it('if a new chat arrives, the new user name is extracted', function() {

      expect(scope.response.length).to.be.eq(0);
      expect(scope.usernames.length).to.be.eq(0);

      scope.group = {}
      scope.group.chat = [{msg: "new chat", user: "boo"}];
      expect(scope.response.length).to.be.eq(0);
      expect(scope.usernames.length).to.be.eq(0);
    })
  });

  describe("addNewUser", function() {
    it('a new message from a new user will modify the usernames', function() {
      expect(scope.response.length).to.be.eq(0);
      expect(scope.usernames.length).to.be.eq(0);

      var msg = {user: "boo"};
      scope.addNewUser(msg);
      expect(scope.response[0]).to.be.eq(msg);
      expect(scope.usernames[0]).to.be.eq("boo");
    })
  })

  describe("clearUserList", function() {
    it('calling the function clears the list of usernames and responses', function() {
      scope.response.push("blah");
      scope.usernames.push("blub");

      scope.clearUserlist();
      expect(scope.response.length).to.be.eq(0); // to.be.empty() doesn't work for some reason. This is the same thing
      expect(scope.usernames.length).to.be.eq(0);
    })

    it('the function is called upon initialization of the controller', function() {
      scope.response.push("blah");
      scope.response.push("blub");
      ctrl = $controller('AutocompleteCtrl', {$scope: scope});

      expect(scope.response.length).to.be.eq(0); // to.be.empty() doesn't work for some reason. This is the same thing
      expect(scope.usernames.length).to.be.eq(0);
    })
  })

  describe("filterUser", function() {
    it('filters with undefined query (not loaded yet) and defaults to true', function() {
        expect(scope.filterUser({user: "boo"})).to.be.eq(true);
    })

    it('filters with null query (no typing yet) and defaults to true', function() {
      scope.query = null
      expect(scope.filterUser({user: "boo"})).to.be.ok
    })

    it('filters with prefix element and returns true', function() {
      scope.query = {text: "pre"}
      expect(scope.filterUser({user: "prefix"})).to.be.ok
    })

    it('filters with nonprefix element and returns false', function() {
      scope.query = {text: "noprefix"}
      expect(scope.filterUser({user: "prefix"})).to.not.be.ok
    })
  });
});
