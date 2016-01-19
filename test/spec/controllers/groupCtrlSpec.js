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

  describe("Group Membership Behavior", function() {
    var party, guild;

    beforeEach(function() {
      party = specHelper.newGroup({
         _id: "unique-party-id",
         type: 'party',
         members: ['leader-id'] // Ensure we wouldn't pass automatically.
      });
      guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: [user._id]
      });
    });

    describe("isMemberOfGroup behavior", function() {
      it("returns true if group is the user's party retrieved from groups service", function() {
        var partyStub = sandbox.stub(groups,"party", function() {
          return party;
        });
    
        expect(scope.isMemberOfGroup(user._id, party)).to.be.ok;
      });
    
      it('returns true if guild is included in myGuilds call', function(){
        var myGuilds = sandbox.stub(groups,"myGuilds", function() {
          return [guild];
        });
    
        expect(scope.isMemberOfGroup(user._id, guild)).to.be.ok;
        expect(myGuilds).to.be.called;
      });
    
      it('does not return true if guild is not included in myGuilds call', function(){
        var myGuilds = sandbox.stub(groups,"myGuilds", function() {
          return [];
        });
    
        expect(scope.isMemberOfGroup('other-user-id', guild)).to.not.be.ok;
        expect(myGuilds).to.be.calledOnce;
      });

      it('does not return true if party members is empty', function(){
        var partyStub = sandbox.stub(groups, "party", function() {
          return {};
        });
        expect(scope.isMemberOfGroup(user._id, party)).to.not.be.ok;
      });
    });

    /**
     * Why is this distinct from the isMemberOfGroup method?  Redundant?
     *
     * This coercion business is troublesome...
     */
    describe.skip("isMember behavior", function() { 
      it("should return true dependent on whether the user id belongs to the group", function() {
        expect(scope.isMember(user, guild)).to.eql(truthy);
        expect(scope.isMember(user, party)).to.eql(falsy);
      });
    });
  });

  describe("isMemberOfPendingQuest/isMemberOfRunningQuest", function() { 
    var runningQuestParty, pendingQuestParty;

    beforeEach(function() {
      runningQuestParty= specHelper.newGroup({
         _id: "unique-party-id",
         type: 'party',
         members: ['leader-id'],
         quest: {
           progress: {},
           active: true,
           members: {}
         }
      });
      pendingQuestParty= specHelper.newGroup({
         _id: "unique-party-id",
         type: 'party',
         members: ['leader-id'],
         quest: {
           progress: {},
           active: false,
           members: {}
         }
      });
      runningQuestParty.quest.members[user._id] = true;
      pendingQuestParty.quest.members[user._id] = true;
    });
 
    it('should return false if no quest in the group', function() {
      runningQuestParty.quest = undefined;
      expect(scope.isMemberOfPendingQuest(user._id, runningQuestParty)).to.eql(false);
      expect(scope.isMemberOfRunningQuest(user._id, runningQuestParty)).to.eql(false);
    });

    it('should return false if no members in the group quest', function() {
      runningQuestParty.quest.members = {};
      expect(scope.isMemberOfPendingQuest(user._id, runningQuestParty)).to.eql(false);
      expect(scope.isMemberOfRunningQuest(user._id, runningQuestParty)).to.eql(false);
    });

    it('should return true/false depending on active flag and the method called', function() {
      expect(scope.isMemberOfPendingQuest(user._id, runningQuestParty)).to.eql(false);
      expect(scope.isMemberOfPendingQuest(user._id, pendingQuestParty)).to.eql(true);
      expect(scope.isMemberOfRunningQuest(user._id, runningQuestParty)).to.eql(true);
      expect(scope.isMemberOfRunningQuest(user._id, pendingQuestParty)).to.eql(false);
    });

    it('should return false if my user isn\'t part of the quest members', function() {
      pendingQuestParty.quest.members = {};
      runningQuestParty.quest.members = {};
      expect(scope.isMemberOfPendingQuest(user._id, pendingQuestParty)).to.eql(false);
      expect(scope.isMemberOfRunningQuest(user._id, runningQuestParty)).to.eql(false);
    });
  });
   
  describe("editGroup", function() {
    var guild, editGuild;

    beforeEach(function() {
      guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: ['not-user-id'],
        $save: function() {}
      });

      // verify initial state, 
      expect(scope.groupCopy).to.eql({});
      expect(guild._editing).to.eql(undefined);
    });


    it('should allow for editing without changing group resource', function() {
      // switch to edit mode
      scope.editGroup(guild);
      expect(guild._editing).to.eql(true);

      // all values should be identical in edit copy
      for(var key in scope.groupCopy) {
        expect(scope.groupCopy[key]).to.eql(guild[key]);
      }

      // change value and verify original is untouched
      scope.groupCopy.leader = 'testLeader';
      expect(scope.groupCopy.leader).to.not.eql(guild.leader);

      // stop editing and verify copy is removed
      scope.cancelEdit(guild);
      expect(scope.groupCopy).to.eql({});
      expect(guild._editing).to.eql(false);

    });

    it('should update group resource only on save', function() {
      var guildSave = sandbox.stub(guild,"$save", function() { });

      // switch to edit mode
      scope.editGroup(guild);
      expect(guild._editing).to.eql(true);

      var testName = 'testName';
      var testLogo = 'testLogo';
      var testNewLeader = 'testNewLeader';
      var testDescription = 'testDesc';

      // get copy for editing
      scope.groupCopy.name = testName;
      scope.groupCopy.logo = testLogo;
      scope.groupCopy._newLeader = testNewLeader;
      scope.groupCopy.description = testDescription;


      expect(guild.name).to.not.eql(testName);
      expect(guild.logo).to.not.eql(testLogo);
      expect(guild._newLeader).to.not.eql(testNewLeader);
      expect(guild.description).to.not.eql(testDescription);

      scope.saveEdit(guild);
      expect(guild.name).to.eql(testName);
      expect(guild.logo).to.eql(testLogo);
      expect(guild._newLeader).to.eql(testNewLeader);
      expect(guild.description).to.eql(testDescription);
      expect(guildSave).to.be.calledOnce;

    });
  });

  /* TODO: Modal testing */
  describe.skip("deleteAllMessages", function() { });
  describe.skip("clickMember", function() { });
  describe.skip("removeMember", function() { });
  describe.skip("confirmRemoveMember", function() { });
  describe.skip("openInviteModal", function() { });
  describe.skip("quickReply", function() { });
});
