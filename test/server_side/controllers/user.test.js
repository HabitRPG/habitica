var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var rewire = require('rewire');

var userController = rewire('../../../website/src/controllers/api-v2/user');

describe('User Controller', function() {

  describe('score', function() {
    var req, res, user;

    beforeEach(function() {
      user = {
        _id: 'user-id',
        _tmp: {
          drop: true
        },
        _statsComputed: {
          maxMP: 100
        },
        ops: {
          score: sinon.stub(),
          addTask: sinon.stub()
        },
        stats: {
          lvl: 10,
          hp: 43,
          mp: 50
        },
        preferences: {
          webhooks: {
            'some-id': {
              sort: 0,
              id: 'some-id',
              enabled: true,
              url: 'http://example.org/endpoint'
            }
          }
        },
        save: sinon.stub(),
        tasks: {
          task_id: {
            id: 'task_id',
            type: 'todo'
          }
        }
      };
      req = {
        language: 'en',
        params: {
          id: 'task_id',
          direction: 'up'
        }
      };
      res = {
        locals: { user: user },
        json: sinon.spy()
      };
    });

    context('early return conditions', function() {
      it('sends an error when no id is provided', function() {
        delete req.params.id;

        userController.score(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(400, {err: ':id required'});
      });

      it('sends an error when no direction is provided', function() {
        delete req.params.direction;

        userController.score(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(400, {err: ":direction must be 'up' or 'down'"});
      });

      it('calls next when direction is "unlink"', function() {
        req.params.direction = 'unlink';
        var nextSpy = sinon.spy();

        userController.score(req, res, nextSpy);

        expect(nextSpy).to.be.calledOnce;
      });

      it('calls next when direction is "sort"', function() {
        req.params.direction = 'sort';
        var nextSpy = sinon.spy();

        userController.score(req, res, nextSpy);

        expect(nextSpy).to.be.calledOnce;
      });
    });

    context('task exists', function() {
      it('sets todo to completed if direction is "up"', function() {
        req.params.direction = 'up';
        req.params.id = 'todo_id';
        user.tasks.todo_id = {
          _id: 'todo_id',
          type: 'todo',
          completed: false
        };

        userController.score(req, res);

        expect(user.tasks.todo_id.completed).to.eql(true);
      });

      it('sets todo to not completed if direction is "down"', function() {
        req.params.direction = 'down';
        req.params.id = 'todo_id';
        user.tasks.todo_id = {
          _id: 'todo_id',
          type: 'todo',
          completed: true
        };

        userController.score(req, res);

        expect(user.tasks.todo_id.completed).to.eql(false);
      });

      it('sets daily to completed if direction is "up"', function() {
        req.params.direction = 'up';
        req.params.id = 'daily_id';
        user.tasks.daily_id = {
          _id: 'daily_id',
          type: 'daily',
          completed: false
        };

        userController.score(req, res);

        expect(user.tasks.daily_id.completed).to.eql(true);
      });

      it('sets daily to not completed if direction is "down"', function() {
        req.params.direction = 'down';
        req.params.id = 'daily_id';
        user.tasks.daily_id = {
          _id: 'daily_id',
          type: 'daily',
          completed: true
        };

        userController.score(req, res);

        expect(user.tasks.daily_id.completed).to.eql(false);
      });
    });

    context('task does not exist', function() {
      it('creates the task', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'todo',
          text: 'some todo',
          notes: 'some notes'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: true,
            type: 'todo',
            text: 'some todo',
            notes: 'some notes'
          }
        });
      });

      it('provides a default note if no note is provided', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'todo',
          text: 'some todo'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: true,
            type: 'todo',
            text: 'some todo',
            notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
          }
        });
      });

      it('todo task is completed if direction is "up"', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.direction = 'up';
        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'todo',
          text: 'some todo',
          notes: 'some notes'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: true,
            type: 'todo',
            text: 'some todo',
            notes: 'some notes'
          }
        });
      });

      it('todo task is not completed if direction is "down"', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.direction = 'down';
        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'todo',
          text: 'some todo',
          notes: 'some notes'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: false,
            type: 'todo',
            text: 'some todo',
            notes: 'some notes'
          }
        });
      });

      it('daily task is completed if direction is "up"', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.direction = 'up';
        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'daily',
          text: 'some daily',
          notes: 'some notes'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: true,
            type: 'daily',
            text: 'some daily',
            notes: 'some notes'
          }
        });
      });

      it('daily task is not completed if direction is "down"', function() {
        user.ops.addTask.returns({id: 'an-id-that-does-not-exist'});

        req.params.direction = 'down';
        req.params.id = 'an-id-that-does-not-exist-yet';
        req.body = {
          type: 'daily',
          text: 'some daily',
          notes: 'some notes'
        }

        userController.score(req, res);

        expect(user.ops.addTask).to.be.calledOnce;
        expect(user.ops.addTask).to.be.calledWith({
          body: {
            id: 'an-id-that-does-not-exist-yet',
            completed: false,
            type: 'daily',
            text: 'some daily',
            notes: 'some notes'
          }
        });
      });
    });

    context('whether task exists or it does not exist', function() {
      it('calls user.ops.score', function() {
        userController.score(req, res);

        expect(user.ops.score).to.be.calledOnce;
        expect(user.ops.score).to.be.calledWith({
          params: {id: 'task_id', direction: 'up'},
          language: 'en'
        });
      });

      it('saves user', function() {
        userController.score(req, res);

        expect(user.save).to.be.calledOnce;
      });
    });

    context('user.save callback', function() {
      var savedUser;
      beforeEach(function() {
        savedUser = {
          stats: user.stats
        }

        user.save.yields(null, savedUser);

        user.ops.score.returns(1.5);
      });

      it('calls next if saving yields an error', function() {
        var nextSpy = sinon.spy();
        user.save.yields('an error');

        userController.score(req, res, nextSpy);

        expect(nextSpy).to.be.calledOnce;
        expect(nextSpy).to.be.calledWith('an error');
      });

      it('sends some user data with res.json', function() {
        userController.score(req, res);

        expect(res.json).to.be.calledOnce;
        expect(res.json).to.be.calledWith(200, {
         delta: 1.5,
         _tmp: user._tmp,
         lvl: 10,
         hp: 43,
         mp: 50
        });
      });

      it('sends webhooks', function() {
        var webhook = require('../../../website/src/libs/webhook');
        sinon.spy(webhook, 'sendTaskWebhook');

        userController.score(req, res);

        expect(webhook.sendTaskWebhook).to.be.calledOnce;
        expect(webhook.sendTaskWebhook).to.be.calledWith(
          user.preferences.webhooks,
          {
            task: {
              delta: 1.5,
              details: { completed: true, id: "task_id", type: "todo" },
              direction: "up"
            },
            user: {
              _id: "user-id",
              _tmp: { drop: true },
              stats: { hp: 43, lvl: 10, maxHealth: 50, maxMP: 100, mp: 50, toNextLevel: 260 }
            }
          }
        );
      });
    });

    context('save callback dealing with non challenge tasks', function() {
      var Challenge = require('../../../website/src/models/challenge').model;

      beforeEach(function() {
        user.save.yields(null, user);
        sinon.stub(Challenge, 'findById');
        req.params.id = 'non_active_challenge_task';
        user.tasks.non_active_challenge_task = {
          id: 'non_active_challenge_task',
          challenge: { id: 'some-id' },
          type: 'todo'
        }
      });

      afterEach(function() {
        Challenge.findById.restore();
      });

      it('returns early if not a challenge', function() {
        delete user.tasks.non_active_challenge_task.challenge;

        userController.score(req, res);

        expect(Challenge.findById).to.not.be.called;
      });

      it('returns early if no challenge id', function() {
        delete user.tasks.non_active_challenge_task.challenge.id;

        userController.score(req, res);

        expect(Challenge.findById).to.not.be.called;
      });

      it('returns early if challenge is broken', function() {
        user.tasks.non_active_challenge_task.challenge.broken = true;

        userController.score(req, res);

        expect(Challenge.findById).to.not.be.called;
      });

      it('returns early if task is a reward', function() {
        user.tasks.non_active_challenge_task.type = 'reward';

        userController.score(req, res);

        expect(Challenge.findById).to.not.be.called;
      });

      it('calls next if there is an error looking up challenge', function() {
        Challenge.findById.yields('an error');
        var nextSpy = sinon.spy();

        userController.score(req, res, nextSpy);

        expect(Challenge.findById).to.be.calledOnce;
        expect(nextSpy).to.be.calledOnce;
        expect(nextSpy).to.be.calledWith('an error');
      });
    });

    context('save callback dealing with challenge tasks', function() {
      var Challenge = require('../../../website/src/models/challenge').model;
      var chal;

      beforeEach(function() {
        chal = {
          id: 'id',
          tasks: {
            active_challenge_task: { id: 'active_challenge_task', value: 1 }
          },
          syncToUser: sinon.spy(),
          save: sinon.spy()
        };
        user.save.yields(null, user);
        user.ops.score.returns(1.4);
        req.params.id = 'active_challenge_task';
        user.tasks.active_challenge_task = {
          id: 'active_challenge_task',
          challenge: { id: 'challenge_id' },
          type: 'todo'
        };

        sinon.stub(Challenge, 'findById');
      });

      afterEach(function() {
        Challenge.findById.restore();
      });

      xit('sets challenge as broken if no challenge can be found', function() {
        Challenge.findById.yields(null, null);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;
        expect(user.tasks.active_challenge_task.challenge.broken).to.eql('CHALLENGE_DELETED');
      });

      it('notifies user if task has been deleted from challenge', function() {
        delete chal.tasks.active_challenge_task;
        Challenge.findById.yields(null, chal);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;
        expect(chal.syncToUser).to.be.calledOnce;
      });

      it('changes task value by delta', function() {
        Challenge.findById.yields(null, chal);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;
        expect(chal.tasks.active_challenge_task.value).to.be.eql(2.4);
      });

      it('adds history if task is a habit', function() {
        chal.tasks.active_challenge_task = {
          id: 'active_challenge_task',
          type: 'habit',
          value: 1,
          history: [{value: 1, date: 1234}]
        };

        Challenge.findById.yields(null, chal);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;

        var historyEvent = chal.tasks.active_challenge_task.history[1];

        expect(historyEvent.value).to.eql(2.4);
        expect(historyEvent.date).to.be.closeTo(+new Date, 10);
      });

      it('adds history if task is a daily', function() {
        chal.tasks.active_challenge_task = {
          id: 'active_challenge_task',
          type: 'daily',
          value: 1,
          history: [{value: 1, date: 1234}]
        };

        Challenge.findById.yields(null, chal);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;

        var historyEvent = chal.tasks.active_challenge_task.history[1];

        expect(historyEvent.value).to.eql(2.4);
        expect(historyEvent.date).to.be.closeTo(+new Date, 10);
      });

      it('saves the challenge data', function() {
        Challenge.findById.yields(null, chal);

        userController.score(req, res);

        expect(Challenge.findById).to.be.calledOnce;
        expect(chal.save).to.be.calledOnce;
      });
    });
  });

  describe('#addTenGems', function() {
    var req, res, user;

    beforeEach(function() {
      user = {
        _id: 'user-id',
        balance: 5,
        save: sinon.stub().yields()
      };
      req = { };
      res = {
        locals: { user: user },
        send: sinon.spy()
      };
    });

    it('adds 2.5 to user balance', function() {
      userController.addTenGems(req, res);

      expect(user.balance).to.eql(7.5);
      expect(user.save).to.be.calledOnce;
    });

    it('sends back 204', function() {
      userController.addTenGems(req, res);

      expect(res.sendStatus).to.be.calledOnce;
      expect(res.sendStatus).to.be.calledWith(204);
    });
  });

  describe('#addHourglass', function() {
    var req, res, user;

    beforeEach(function() {
      user = {
        _id: 'user-id',
        purchased: { plan: { consecutive: { trinkets: 3 } } },
        save: sinon.stub().yields()
      };
      req = { };
      res = {
        locals: { user: user },
        send: sinon.spy()
      };
    });

    it('adds an hourglass to user', function() {
      userController.addHourglass(req, res);

      expect(user.purchased.plan.consecutive.trinkets).to.eql(4);
      expect(user.save).to.be.calledOnce;
    });

    it('sends back 204', function() {
      userController.addHourglass(req, res);

      expect(res.sendStatus).to.be.calledOnce;
      expect(res.sendStatus).to.be.calledWith(204);
    });
  });
});
