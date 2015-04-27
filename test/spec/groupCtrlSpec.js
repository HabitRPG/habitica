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
  var scope, ctrl, user, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('AutocompleteCtrl', {$scope: scope});
    });
  });

  describe("filterUser", function() {
    it('filters with undefined query (not loaded yet) and returns false (so it will not be rendered)', function() {
        expect(scope.filterUser({user: "boo"})).to.be.eq(false);
    })

    it('filters with null query (no typing yet) and returns false (so it will not be rendered)', function() {
      scope.query = null
      expect(scope.filterUser({user: "boo"})).to.be.eq(false);
    })

    it('filters with empty prefix and returns true', function() {
      scope.query = {text: ""}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
    })

    it('filters with prefix element and returns true', function() {
      scope.query = {text: "pre"}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(true);
    })

    it('filters with nonprefix element and returns false', function() {
      scope.query = {text: "noprefix"}
      expect(scope.filterUser({user: "prefix"})).to.be.eq(false);
    })
  });
});
