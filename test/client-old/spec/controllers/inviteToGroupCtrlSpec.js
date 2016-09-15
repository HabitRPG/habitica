'use strict';

describe('Invite to Group Controller', function() {
  var scope, ctrl, groups, user, guild, rootScope, $controller;

  beforeEach(function() {
    user = specHelper.newUser({
      profile: { name: 'Mario' }
    });

    module(function($provide) {
      $provide.value('User', {});
      $provide.value('injectedGroup', { user: user });
    });

    inject(function(_$rootScope_, _$controller_, Groups) {
      rootScope = _$rootScope_;

      scope = _$rootScope_.$new();

      $controller = _$controller_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('InviteToGroupCtrl', {$scope: scope, User: {user: user}});

      groups = Groups;
    });
  });

  describe('addEmail', function() {
    it('adds blank email to email list', function() {
      scope.emails = [{name: 'Mario', email: 'mario@mushroomkingdom.com'}];
      scope.addEmail();

      expect(scope.emails).to.eql([{name: 'Mario', email: 'mario@mushroomkingdom.com'}, {name: '', email: ''}]);
    });
  });

  describe('addUuid', function() {
    it('adds blank uuid to invitees list', function() {
      scope.invitees = [{uuid: 'user1'}];
      scope.addUuid();

      expect(scope.invitees).to.eql([{uuid: 'user1'}, {uuid: ''}]);
    });
  });

  describe('inviteNewUsers', function() {
    var groupInvite, groupCreate;

    beforeEach(function() {
      scope.group = specHelper.newGroup({
        type: 'party',
      });

      groupCreate = sandbox.stub(groups.Group, 'create');
      groupInvite = sandbox.stub(groups.Group, 'invite');
    });

    context('if the party does not already exist', function() {
      var groupResponse;

      beforeEach(function() {
        delete scope.group._id;
        groupResponse = {data: {data: scope.group}}
      });

      it('saves the group if a new group is being created', function() {
        groupCreate.returns(Promise.resolve(groupResponse));
        scope.inviteNewUsers('uuid');
        expect(groupCreate).to.be.calledOnce;
      });

      it('uses provided name', function() {
        scope.group.name = 'test party';

        groupCreate.returns(Promise.resolve(groupResponse));

        scope.inviteNewUsers('uuid');

        expect(groupCreate).to.be.calledWith(scope.group);
        expect(scope.group.name).to.eql('test party');
      });

      it('names the group if no name is provided', function() {
        scope.group.name = '';

        groupCreate.returns(Promise.resolve(groupResponse));

        scope.inviteNewUsers('uuid');

        expect(groupCreate).to.be.calledWith(scope.group);
        expect(scope.group.name).to.eql(env.t('possessiveParty', {name: user.profile.name}));
      });
    });

    context('email', function() {
      beforeEach(function () {
        sandbox.stub(rootScope, 'hardRedirect');
      });

      it('invites user with emails', function(done) {
        scope.emails = [
          {name: 'Luigi', email: 'mario_bro@themushroomkingdom.com'},
          {name: 'Mario', email: 'mario@tmk.com'}
        ];

        var inviteDetails = {
          inviter: user.profile.name,
          emails: [
            {name: 'Luigi', email: 'mario_bro@themushroomkingdom.com'},
            {name: 'Mario', email: 'mario@tmk.com'}
          ]
        };

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              expect(groupInvite).to.be.calledOnce;
              expect(groupInvite).to.be.calledWith(scope.group._id, inviteDetails);
              done();
            })
        );

        scope.inviteNewUsers('email');
      });

      it('resets email list after sending', function(done) {
        scope.emails[0].name = 'Luigi';
        scope.emails[0].email = 'mario_bro@themushroomkingdom.com';

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              //We use a timeout to test items that happen after the promise is resolved
              setTimeout(function(){
                expect(scope.emails).to.eql([{name:'', email: ''},{name:'', email: ''}]);
                done();
              }, 1000);
            })
        );

        scope.inviteNewUsers('email');
      });

      it('filters out blank email inputs', function() {
        scope.emails = [
          {name: 'Luigi', email: 'mario_bro@themushroomkingdom.com'},
          {name: 'Toad', email: ''},
          {name: 'Mario', email: 'mario@tmk.com'}
        ];

        var inviteDetails = {
          inviter: user.profile.name,
          emails: [
            {name: 'Luigi', email: 'mario_bro@themushroomkingdom.com'},
            {name: 'Mario', email: 'mario@tmk.com'}
          ]
        };

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              expect(groupInvite).to.be.calledOnce;
              expect(groupInvite).to.be.calledWith(scope.group._id, inviteDetails);
              done();
            })
        );

        scope.inviteNewUsers('email');
      });
    });

    context('uuid', function() {
      beforeEach(function () {
        sandbox.stub(rootScope, 'hardRedirect');
      });

      it('invites user with uuid', function(done) {
        scope.invitees = [{uuid: '1234'}];

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              expect(groupInvite).to.be.calledOnce;
              expect(groupInvite).to.be.calledWith(scope.group._id, { uuids: ['1234'] });
              done();
            })
        );

        scope.inviteNewUsers('uuid');
      });

      it('invites users with uuids', function(done) {
        scope.invitees = [{uuid: 'user1'}, {uuid: 'user2'}, {uuid: 'user3'}];

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              expect(groupInvite).to.be.calledOnce;
              expect(groupInvite).to.be.calledWith(scope.group._id, { uuids: ['user1', 'user2', 'user3'] });
              done();
            })
        );

        scope.inviteNewUsers('uuid');
      });

      it('resets invitee list after sending', function(done) {
        scope.invitees = [{uuid: 'user1'}, {uuid: 'user2'}, {uuid: 'user3'}];

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              //We use a timeout to test items that happen after the promise is resolved
              setTimeout(function(){
                expect(scope.invitees).to.eql([{uuid: ''}]);
                done();
              }, 1000);
              done();
            })
        );

        scope.inviteNewUsers('uuid');
      });

      it('removes blank fields from being sent', function() {
        scope.invitees = [{uuid: 'user1'}, {uuid: ''}, {uuid: 'user3'}];

        groupInvite.returns(
          Promise.resolve()
            .then(function () {
              expect(groupInvite).to.be.calledOnce;
              expect(groupInvite).to.be.calledWith(scope.group._id, { uuids: ['user1', 'user3'] });
              done();
            })
        );

        scope.inviteNewUsers('uuid');
      });
    });

    context('invalid invite method', function() {
      it('logs error', function() {
        sandbox.stub(console, 'log');

        scope.inviteNewUsers();
        expect(groups.Group.invite).to.not.be.called;
        expect(console.log).to.be.calledOnce;
        expect(console.log).to.be.calledWith('Invalid invite method.');
      });
    });

  });
});
