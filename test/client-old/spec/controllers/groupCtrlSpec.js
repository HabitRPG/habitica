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

  describe("isMemberOfPendingQuest", function() {
    var party;
    var partyStub;

    beforeEach(function () {
      party = specHelper.newGroup({
        _id: "unique-party-id",
        type: 'party',
        members: ['leader-id'] // Ensure we wouldn't pass automatically.
      });

      partyStub = sandbox.stub(groups, "party", function() {
        return party;
      });
    });

    it("returns false if group is does not have a quest", function() {
      expect(scope.isMemberOfPendingQuest(user._id, party)).to.not.be.ok;
    });

    it("returns false if group quest has not members", function() {
      party.quest = {
        'key': 'random-key',
      };
      expect(scope.isMemberOfPendingQuest(user._id, party)).to.not.be.ok;
    });

    it("returns false if group quest is active", function() {
      party.quest = {
        'key': 'random-key',
        'members': {},
        'active': true,
      };
      party.quest.members[user._id] = true;
      expect(scope.isMemberOfPendingQuest(user._id, party)).to.not.be.ok;
    });

    it("returns true if user is a member of a pending quest", function() {
      party.quest = {
        'key': 'random-key',
        'members': {},
      };
      party.quest.members[user._id] = true;
      expect(scope.isMemberOfPendingQuest(user._id, party)).to.be.ok;
    });
  });

  describe("isMemberOfGroup", function() {
    it("returns true if group is the user's party retrieved from groups service", function() {
      var party = specHelper.newGroup({
        _id: "unique-party-id",
        type: 'party',
        members: ['leader-id'] // Ensure we wouldn't pass automatically.
      });

      var partyStub = sandbox.stub(groups, "party", function() {
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

      user.guilds = [guild._id];

      expect(scope.isMemberOfGroup(user._id, guild)).to.be.ok;
    });

    it('does not return true if guild is not included in myGuilds call', function(){

      var guild = specHelper.newGroup({
        _id: "unique-guild-id",
        type: 'guild',
        members: ['not-user-id']
      });

      user.guilds = [];

      expect(scope.isMemberOfGroup(user._id, guild)).to.not.be.ok;
    });
  });

  describe('editGroup', () => {
    var guild;

    beforeEach(() => {
      guild = specHelper.newGroup({
        _id: 'unique-guild-id',
        leader: 'old leader',
        type: 'guild',
        members: ['not-user-id'],
        $save: sandbox.spy(),
      });
    });

    it('marks group as being in edit mode', () => {
      scope.editGroup(guild);

      expect(guild._editing).to.eql(true);
    });

    it('copies group to groupCopy', () => {
      scope.editGroup(guild);

      for (var key in scope.groupCopy) {
        expect(scope.groupCopy[key]).to.eql(guild[key]);
      }
    });

    it('does not change original group when groupCopy is changed', () => {
      scope.editGroup(guild);

      scope.groupCopy.leader = 'new leader';
      expect(scope.groupCopy.leader).to.not.eql(guild.leader);
    });
  });

  describe('saveEdit', () => {
    let guild;

    beforeEach(() => {
      guild = specHelper.newGroup({
        _id: 'unique-guild-id',
        name: 'old name',
        leader: 'old leader',
        type: 'guild',
        members: ['not-user-id'],
        $save: () => {},
      });

      scope.editGroup(guild);
    });

    it('calls group update', () => {
      let guildUpdate = sandbox.spy(groups.Group, 'update');

      scope.saveEdit(guild);

      expect(guildUpdate).to.be.calledOnce;
    });

    it('calls cancelEdit', () => {
      sandbox.stub(scope, 'cancelEdit');

      scope.saveEdit(guild);

      expect(scope.cancelEdit).to.be.calledOnce;
    });

    it('applies changes to groupCopy to original group', () => {
      scope.groupCopy.name = 'new name';

      scope.saveEdit(guild);

      expect(guild.name).to.eql('new name');
    });

    it('assigns leader id to group if leader has changed', () => {
      scope.groupCopy._newLeader = { _id: 'some leader id' };

      scope.saveEdit(guild);

      expect(guild.leader).to.eql('some leader id');
    });

    it('does not assign new leader id if leader object is not passed in', () => {
      scope.groupCopy._newLeader = 'not an object';

      scope.saveEdit(guild);

      expect(guild.leader).to.eql('old leader');
    });
  });

  describe('cancelEdit', () => {
    beforeEach(() => {
      guild = specHelper.newGroup({
        _id: 'unique-guild-id',
        name: 'old name',
        leader: 'old leader',
        type: 'guild',
        members: ['not-user-id'],
        $save: () => {},
      });

      scope.editGroup(guild);
    });

    it('sets _editing to false on group', () => {
      expect(guild._editing).to.eql(true);

      scope.cancelEdit(guild);

      expect(guild._editing).to.eql(false);
    });

    it('reset groupCopy to an empty object', () => {
      expect(scope.groupCopy).to.not.eql({});

      scope.cancelEdit(guild);

      expect(scope.groupCopy).to.eql({});
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
