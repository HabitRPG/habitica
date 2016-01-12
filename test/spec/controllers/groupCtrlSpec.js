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

  describe("Group Edit Behavior", function() {
    it('should allow for editing without changing group resource', function() {
      var guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: ['not-user-id']
      });


      // verify initial state, 
      // TODO: Check how to do this once per test in this "describe"
      var editGuild = scope.groupCopy;
      expect(editGuild).to.eql({});
      expect(guild._editing).to.eql(undefined);

      // switch to edit mode
      scope.editGroup(guild);
      var editGuild = scope.groupCopy;
      expect(guild._editing).to.eql(true);

      // all values should be identical in edit copy
      for(var key in editGuild) {
        expect(editGuild[key]).to.eql(guild[key]);
      }

      // change value and verify original is untouched
      editGuild.leader = 'testLeader';
      expect(editGuild.leader).to.not.eql(guild.leader);

      // stop editing and verify copy is removed
      scope.cancelEdit(guild);
      editGuild = scope.groupCopy;
      expect(editGuild).to.eql({});
      expect(guild._editing).to.eql(false);

    });

    it('should update group resource only on save', function() {
      var guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: ['not-user-id']
      });

      guild.$save = function() { };

      // verify initial state
      var editGuild = scope.groupCopy;
      expect(editGuild).to.eql({});
      expect(guild._editing).to.eql(undefined);

      // switch to edit mode
      scope.editGroup(guild);
      var editGuild = scope.groupCopy;
      expect(guild._editing).to.eql(true);

      // get copy for editing
      editGuild.name= 'testName';
      editGuild.logo = 'testLogo';
      editGuild.description = 'testDesc';
      editGuild._newLeader= 'testNewLeader';


      expect(guild.name).to.not.eql(editGuild.name);
      expect(guild.logo).to.not.eql(editGuild.logo);
      expect(guild.description).to.not.eql(editGuild.description);
      expect(guild._newLeader).to.not.eql(editGuild._newLeader);

      scope.saveEdit(guild);
      expect(guild.name).to.eql(editGuild.name);
      expect(guild.logo).to.eql(editGuild.logo);
      expect(guild.description).to.eql(editGuild.description);
      expect(guild._newLeader).to.eql(editGuild._newLeader);

    });
  });
});
