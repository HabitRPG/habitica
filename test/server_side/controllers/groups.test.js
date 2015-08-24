var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect

var groupsController = require('../../../website/src/controllers/groups');

describe('Groups Controller', function() {

  describe('#questLeave', function() {
    var res, req, group, user, saveSpy;

    beforeEach(function() {
      sinon.stub(process, 'nextTick').yields();

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

    afterEach(function () {
      process.nextTick.restore();
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
        group.save = sinon.stub().yields('save error');
        var nextSpy = sinon.spy();

        groupsController.questLeave(req, res, nextSpy);

        expect(nextSpy).to.be.calledOnce;
        expect(nextSpy).to.be.calledWith('save error');
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
