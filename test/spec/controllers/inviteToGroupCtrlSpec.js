'use strict';

describe('Invite to Group Controller', function() {
  var scope, ctrl, groups, user, guild, $rootScope;

  beforeEach(function() {
    user = specHelper.newUser({
      profile: { name: 'Mario' }
    });

    module(function($provide) {
      $provide.value('User', {});
      $provide.value('injectedGroup', { user: user });
    });

    inject(function($rootScope, $controller, Groups){
      scope = $rootScope.$new();

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
    beforeEach(function() {
      scope.group = specHelper.newGroup();
      sandbox.stub(groups.Group, 'invite');
    });

    context('email', function() {
      it('invites user with emails', function() {
        scope.emails[0].name = 'Luigi';
        scope.emails[0].email = 'mario_bro@themushroomkingdom.com';

        scope.inviteNewUsers('email');
        expect(groups.Group.invite).to.be.calledOnce;
        expect(groups.Group.invite).to.be.calledWith({
          gid: scope.group._id,
        }, {
          inviter: user.profile.name,
          emails: [{name: 'Luigi', email: 'mario_bro@themushroomkingdom.com'},{name: '', email: ''}]

        });
      });

      it('resets email list after sending', function() {
        groups.Group.invite.yields();
        scope.emails[0].name = 'Luigi';
        scope.emails[0].email = 'mario_bro@themushroomkingdom.com';

        scope.inviteNewUsers('email');

        expect(scope.emails).to.eql([{name:'', email: ''},{name:'', email: ''}]);
      });
    });

    context('uuid', function() {
      it('invites user with uuid', function() {
        scope.invitees = [{uuid: '1234'}];

        scope.inviteNewUsers('uuid');
        expect(groups.Group.invite).to.be.calledOnce;
        expect(groups.Group.invite).to.be.calledWith({
          gid: scope.group._id,
        }, {
          uuids: ['1234']
        });
      });

      it('invites users with uuids', function() {
        scope.invitees = [{uuid: 'user1'}, {uuid: 'user2'}, {uuid: 'user3'}];

        scope.inviteNewUsers('uuid');
        expect(groups.Group.invite).to.be.calledOnce;
        expect(groups.Group.invite).to.be.calledWith({
          gid: scope.group._id,
        }, {
          uuids: ['user1', 'user2', 'user3']
        });
      });

      it('resets invitee list after sending', function() {
        groups.Group.invite.yields();
        scope.invitees = [{uuid: 'user1'}, {uuid: 'user2'}, {uuid: 'user3'}];

        scope.inviteNewUsers('uuid');

        expect(scope.invitees).to.eql([{uuid: ''}]);
      });

      it('removes blank fields from being sent', function() {
        groups.Group.invite.yields();
        scope.invitees = [{uuid: 'user1'}, {uuid: ''}, {uuid: 'user3'}];

        scope.inviteNewUsers('uuid');

        expect(groups.Group.invite).to.be.calledOnce;
        expect(groups.Group.invite).to.be.calledWith({
          gid: scope.group._id,
        }, {
          uuids: ['user1', 'user3']
        });
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
