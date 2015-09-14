var sinon = require('sinon');
var chai = require("chai");
chai.use(require("sinon-chai"));
var expect = chai.expect;

var Q = require('q');
var Group = require('../../../website/src/models/group').model;
var groupsController = require('../../../website/src/controllers/groups');

describe('Groups Controller', function() {
  var utils = require('../../../website/src/utils');

  describe('#invite', function() {
    var res, req, user, group;

    beforeEach(function() {
      group = {
        _id: 'group-id',
        name: 'group-name',
        type: 'party',
        members: [
          'user-id',
          'another-user'
        ],
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      user = {
        _id: 'user-id',
        name: 'inviter',
        email: 'inviter@example.com',
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      res = {
        locals: {
          group: group,
          user: user
        },
        json: sinon.stub(),
        send: sinon.stub()
      };

      req = {
        body: {}
      };
    });

    context('uuids', function() {
      beforeEach(function() {
        req.body.uuids = ['invited-user'];
      });

      it('returns 400 if user not found');

      it('returns a 400 if user is already in the group');

      it('retuns 400 if user was already invited to that group');

      it('returns 400 if user is already pending an invitation');

      it('returns 400 is user is already in another party');

      it('emails invited user');

      it('does not email invited user if email preference is set to false');
    });

    context('emails', function() {
      var EmailUnsubscription = require('../../../website/src/models/emailUnsubscription').model;
      var execStub, selectStub;

      beforeEach(function() {
        sinon.stub(utils, 'encrypt').returns('http://link.com');
        sinon.stub(utils, 'getUserInfo').returns({
          name: user.name,
          email: user.email
        });
        execStub = sinon.stub();
        selectStub = sinon.stub().returns({
          exec: execStub
        });
        sinon.stub(User, 'findOne').returns({
          select: selectStub
        });
        sinon.stub(EmailUnsubscription, 'findOne');
        sinon.stub(utils, 'txnEmail');

        req.body.emails = [{email: 'user@example.com', name: 'user'}];
      });

      afterEach(function() {
        User.findOne.restore();
        EmailUnsubscription.findOne.restore();
        utils.encrypt.restore();
        utils.getUserInfo.restore();
        utils.txnEmail.restore();
      });

      it('emails user with invite', function() {
        execStub.yields(null, null);
        EmailUnsubscription.findOne.yields(null, null);

        groupsController.invite(req, res);

        expect(utils.txnEmail).to.be.calledOnce;
        expect(utils.txnEmail).to.be.calledWith(
          { email: 'user@example.com', name: 'user' },
          'invite-friend',
          [
            { name: 'LINK', content: '?partyInvite=http://link.com' },
            { name: 'INVITER', content: 'inviter' },
            { name: 'REPLY_TO_ADDRESS', content: 'inviter@example.com' }
          ]
        );
      });

      it('does not email user if user is on unsubscribe list', function() {
        EmailUnsubscription.findOne.yields(null, {_id: 'on-list'});

        expect(utils.txnEmail).to.not.be.called;
      });

      it('checks if a user with provided email already exists');
    });

    context('others', function() {
      it ('returns a 400 error', function() {
        groupsController.invite(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(
          400,
          { err: 'Can invite only by email or uuid' }
        );
      });
    });
  });

  describe('#leave', function() {
    var res, req, user, group;

    beforeEach(function() {
      group = {
        _id: 'group-id',
        type: 'party',
        members: [
          'user-id',
          'another-user'
        ],
        save: sinon.stub().yields(),
        leave: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      user = {
        _id: 'user-id',
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      res = {
        locals: {
          group: group,
          user: user
        },
        json: sinon.stub(),
        send: sinon.stub()
      };

      req = {
        query: { keep: 'keep' }
      };
    });

    context('party', function() {
      beforeEach(function() {
        group.type = 'party';
      });

      it('prevents user from leaving party if quest is active and part of the active members list', function() {
        group.quest = {
          active: true,
          members: {
            another_user: true,
            yet_another_user: null,
            'user-id': true
          }
        };

        groupsController.leave(req, res);

        expect(group.leave).to.not.be.called;
        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(403, 'You cannot leave party during an active quest. Please leave the quest first');
      });

      it('prevents quest leader from leaving a party if they have started a quest', function() {
        group.quest = {
          active: false,
          leader: 'user-id'
        };

        groupsController.leave(req, res);

        expect(group.leave).to.not.be.called;
        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(403, 'You cannot leave party when you have started a quest. Abort the quest first.');
      });

      it('leaves party if quest is not active', function() {
        group.quest = {
          active: false,
          members: {
            another_user: true,
            yet_another_user: null,
            'user-id': null
          }
        };

        groupsController.leave(req, res);

        expect(group.leave).to.be.calledOnce;
        expect(res.json).to.not.be.called;
      });

      it('leaves party if quest is active, but user is not part of quest', function() {
        group.quest = {
          active: true,
          members: {
            another_user: true,
            yet_another_user: null,
            'user-id': null
          }
        };

        groupsController.leave(req, res);

        expect(group.leave).to.be.calledOnce;
        expect(res.json).to.not.be.called;
      });
    });
  });

  describe('#questReject', function() {
    var res, req, group, user, saveSpy;

    beforeEach(function() {
      sinon.stub(User, 'update').returns({
        exec: sinon.stub()
      });

      group = {
        _id: 'group-id',
        type: 'party',
        quest: {
          leader : 'quest-leader',
          active: false,
          members: {
            'user-id': null,
            'another-user': null,
            'quest-leader': true
          },
          key : 'vice1',
          progress : {
            hp : 364,
            collect : {}
          }
        },
        save: sinon.stub().yields(null, group),
        markModified: sinon.spy()
      };

      user = {
        _id: 'user-id',
        party : {
          quest : {
              key : 'vice1',
              progress : {
                  up : 50,
                  down : 0,
                  collect : {}
              },
              completed : null,
              RSVPNeeded : false
          }
        },
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      res = {
        locals: {
          group: group,
          user: user
        },
        json: sinon.stub(),
        send: sinon.stub()
      };

      req = {
        query: { }
      };
    });

    afterEach(function() {
      User.update.restore();
    });

    it('returns error if no key provided', function() {
      delete group.quest.key;

      groupsController.questReject(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(400, {
        err: 'No quest invitation has been sent out yet.'
      });
    });

    it('returns error if quest is already active', function() {
      group.quest.active = true;

      groupsController.questReject(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(400, {
        err: 'Quest already began.'
      });
    });

    it('removes RSPVNeeded from user object', function() {
      groupsController.questReject(req, res);

      expect(User.update).to.be.calledOnce;
      expect(User.update).to.be.calledWith(
        { _id: 'user-id' },
        { $set: {'party.quest.RSVPNeeded': false, 'party.quest.key': null}}
      );
    });

    it('rejects invitation', function() {
      groupsController.questReject(req, res);

      expect(group.quest.members['user-id']).to.eql(false);
    });

    it('starts quest if last pending user rejects', function() {
      group.quest.members['another-user'] = true;

      groupsController.questReject(req, res);

      expect(group.quest.active).to.eql(true);
    });

    it('does not start quest if there is another user still pending', function() {
      groupsController.questReject(req, res);

      expect(group.quest.active).to.eql(false);
    });

    it('sends back group id and quest object', function() {
      groupsController.questReject(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(201, {
        _id: 'group-id',
        quest: {
          leader : 'quest-leader',
          active: false,
          members: {
            'user-id': false,
            'another-user': null,
            'quest-leader': true
          },
          key : 'vice1',
          progress : {
            hp : 364,
            collect : {}
          }
        }
      });
    });
  });

  describe('#questAccept', function() {
    var res, req, group, user, saveSpy;

    beforeEach(function() {
      sinon.stub(User, 'update').returns({
        exec: sinon.stub()
      });

      group = {
        _id: 'group-id',
        type: 'party',
        quest: {
          leader : 'quest-leader',
          active: false,
          members: {
            'user-id': null,
            'another-user': null,
            'quest-leader': true
          },
          key : 'vice1',
          progress : {
            hp : 364,
            collect : {}
          }
        },
        save: sinon.stub(),
        markModified: sinon.spy()
      };

      user = {
        _id: 'user-id',
        party : {
          quest : {
              key : 'vice1',
              progress : {
                  up : 50,
                  down : 0,
                  collect : {}
              },
              completed : null,
              RSVPNeeded : false
          }
        },
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      res = {
        locals: {
          group: group,
          user: user
        },
        json: sinon.stub(),
        send: sinon.stub()
      };

      req = {
        query: { }
      };
    });

    afterEach(function() {
      User.update.restore();
    });

    it('errors if user is not in group', function() {
      delete res.locals.group;

      groupsController.questAccept(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(400, {err: 'Must be in a party to start quests.'});
    });

    context('new quest', function() {
      it('starts a new quest if a quest key is provided');

      it('errors if quest does not exist');

      it('errors if user is below required level for quest');

      it('errors if user does not own quest scroll');

      it('invites the other members of the group');

      it('sets quest leader to user');

      it('sets user as participating in quest');
    });

    context('existing quest', function() {
      it('accepts quest');

      it('allows leader to force quest to start');

      it('starts quest if last pending user accepts');

      it('sends back group id and quest object', function() {
        group.save.yields(null, group);

        groupsController.questAccept(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(201, {
          _id: 'group-id',
          quest: {
            leader : 'quest-leader',
            active: false,
            members: {
              'user-id': true,
              'another-user': null,
              'quest-leader': true
            },
            key : 'vice1',
            progress : {
              hp : 364,
              collect : {}
            }
          }
        });
      });
    });
  });

  describe('#questCancel', function() {
    var req, res, user, group;

    beforeEach(function() {
      group = {
        _id: 'group-id',
        quest: {
          key: 'whale',
          progress: { up: 500 },
          leader: 'leader-id',
          active: false
        },
        members: ['user-id', 'leader-id', 'another-user'],
        markModified: sinon.stub(),
        save: sinon.stub()
      };
      req = {};
      res = {
        locals: { group: group },
        json: sinon.stub()
      };
    });

    it('cancels quest', function() {
      groupsController.questCancel(req, res);

      expect(group.quest).to.eql({
        key: null,
        progress: {},
        leader: null
      });
    });

    it('removes quest invitation from each user');

    it('sends back group id and quest object', function() {
      group.save.yields();

      groupsController.questCancel(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(201, {
        _id: 'group-id',
        quest: {
          key : null,
          leader: null,
          progress : { }
        }
      });
    });
  });

  describe('#questAbort', function() {
    var req, res, user, group;

    beforeEach(function() {
      sinon.stub(User, 'update').withArgs({_id: {$in: ['user-id', 'leader-id', 'another-user']}}).yields();
      User.update.returns({exec: sinon.stub()});

      group = {
        _id: 'group-id',
        quest: {
          key: 'whale',
          progress: { up: 500 },
          members: {'user-id': true, 'leader-id': true, 'another-user': true},
          leader: 'leader-id',
          active: true
        },
        members: ['user-id', 'leader-id', 'another-user'],
        markModified: sinon.stub(),
        save: sinon.stub()
      };
      req = {};
      res = {
        locals: { group: group },
        json: sinon.stub()
      };
    });

    afterEach(function() {
      User.update.restore();
    });

    it('aborts quest');

    it('removes quet progress from users');

    it('returns quest scroll to leader');

    it('sends back group id and quest object', function() {
      group.save.yields();

      groupsController.questAbort(req, res);

      expect(res.json).to.be.calledOnce;
      expect(res.json).to.be.calledWith(201, {
        _id: 'group-id',
        quest: {
          key : null,
          leader: null,
          progress : { }
        }
      });
    });
  });

  describe('#questLeave', function() {
    var res, req, group, user, saveSpy;

    beforeEach(function() {
      sinon.stub(Q, 'all').returns({
        done: sinon.stub().yields()
      });
      group = {
        _id: 'group-id',
        type: 'party',
        quest: {
          leader : 'another-user',
          active: true,
          members: {
            'user-id': true,
            'another-user': true
          },
          key : 'vice1',
          progress : {
              hp : 364,
              collect : {}
          }
        },
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      user = {
        _id: 'user-id',
        party : {
          quest : {
              key : 'vice1',
              progress : {
                  up : 50,
                  down : 0,
                  collect : {}
              },
              completed : null,
              RSVPNeeded : false
          }
        },
        save: sinon.stub().yields(),
        markModified: sinon.spy()
      };

      res = {
        locals: {
          group: group,
          user: user
        },
        json: sinon.stub(),
        send: sinon.stub()
      };

      req = { };
    });

    afterEach(function() {
      Q.all.restore();
    });

    context('error conditions', function() {
      it('errors if quest is not active', function() {
        group.quest.active = false;

        groupsController.questLeave(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(
          404,
          { err: 'No active quest to leave' }
        );
      });

      it('errors if user is not part of quest', function() {
        delete group.quest.members[user._id];

        groupsController.questLeave(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(
          403,
          { err: 'You are not part of the quest' }
        );
      });

      it('does not allow quest leader to leave quest', function() {
        group.quest.leader = 'user-id';

        groupsController.questLeave(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(
          403,
          { err: 'Quest leader cannot leave quest' }
        );
      });

      it('sends 500 if group cannot save', function() {
        Q.all.returns({
          done: sinon.stub().callsArgWith(1, {err: 'save error'})
        });
        var nextSpy = sinon.spy();

        groupsController.questLeave(req, res, nextSpy);

        expect(res.json).to.not.be.called;
        expect(nextSpy).to.be.calledOnce;
        expect(nextSpy).to.be.calledWith({err: 'save error'});
      });
    });

    context('success', function() {
      it('removes user from quest', function() {
        expect(group.quest.members[user._id]).to.exist;

        groupsController.questLeave(req, res);

        expect(group.quest.members[user._id]).to.not.exist;
      });

      it('scrubs quest data from user', function() {
        user.party.quest.progress = {
          up: 100,
          down: 32,
          collect: {
            foo: 12,
            bar: 4
          }
        };

        groupsController.questLeave(req, res);

        expect(user.party.quest.key).to.not.exist;
        expect(user.party.quest.progress).to.eql({
          up: 0,
          down: 0,
          collect: {}
        });
      });

      it('sends group id and quest object', function() {
        groupsController.questLeave(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(201, {
          _id: 'group-id',
          quest: {
            active: true,
            key: 'vice1',
            leader: 'another-user',
            members: { 'another-user': true },
            progress: { collect: {  }, hp: 364 }
          }
        });
      });
    });
  });
});
