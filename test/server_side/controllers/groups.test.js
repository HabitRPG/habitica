var sinon = require('sinon');
var chai = require("chai");
chai.use(require('chai-as-promised'));
chai.use(require("sinon-chai"));
var expect = chai.expect;

var Q = require('q');
var Group = require('../../../website/src/models/group').model;
var groupsController = require('../../../website/src/controllers/groups');

describe('Groups Controller', function() {
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
        group.quest = {
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
        };

        sinon.spy(Group, 'update');
      });

      afterEach(function() {
        Group.update.restore();
      });

      it('prevents user from leaving party if quest is active', function() {
        user.party = {
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
        }

        groupsController.leave(req, res);

        expect(Group.update).to.not.be.called;
        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(403, 'You cannot leave party during an active quest. Please leave the quest first');
      });

      it('leaves party if quest is not active', function() {
        user.party = { quest: { key: null } };

        groupsController.leave(req, res);

        expect(Group.update).to.be.calledOnce;
        expect(res.json).to.not.be.called;
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

      it('sends back 204 on success', function() {
        groupsController.questLeave(req, res);

        expect(res.send).to.be.calledOnce;
        expect(res.send).to.be.calledWith(204);
      });
    });
  });
});
