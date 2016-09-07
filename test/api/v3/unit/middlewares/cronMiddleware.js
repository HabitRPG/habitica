import {
  generateRes,
  generateReq,
  generateTodo,
  generateDaily,
} from '../../../../helpers/api-unit.helper';
import { cloneDeep } from 'lodash';
import cronMiddleware from '../../../../../website/server/middlewares/cron';
import moment from 'moment';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import * as Tasks from '../../../../../website/server/models/task';
import analyticsService from '../../../../../website/server/libs/analyticsService';
import * as cronLib from '../../../../../website/server/libs/cron';
import { v4 as generateUUID } from 'uuid';

describe('cron middleware', () => {
  let res, req;
  let user;

  beforeEach((done) => {
    res = generateRes();
    req = generateReq();
    user = new User({
      auth: {
        local: {
          username: 'username',
          lowerCaseUsername: 'username',
          email: 'email@email.email',
          salt: 'salt',
          hashed_password: 'hashed_password', // eslint-disable-line camelcase
        },
      },
    });

    user.save()
    .then(savedUser => {
      savedUser._statsComputed = {
        mp: 10,
        maxMP: 100,
      };

      res.locals.user = savedUser;
      res.analytics = analyticsService;
      done();
    })
    .catch(done);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('calls next when user is not attached', (done) => {
    res.locals.user = null;
    cronMiddleware(req, res, done);
  });

  it('calls next when days have not been missed', (done) => {
    cronMiddleware(req, res, done);
  });

  it('should clear todos older than 30 days for free users', async (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    await task.save();
    await user.save();

    cronMiddleware(req, res, (err) => {
      Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
        expect(secondErr).to.not.exist;
        expect(taskFound).to.not.exist;
        done(err);
      });
    });
  });

  it('should not clear todos older than 30 days for subscribed users', async (done) => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    await task.save();
    await user.save();

    cronMiddleware(req, res, (err) => {
      Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
        expect(secondErr).to.not.exist;
        expect(taskFound).to.exist;
        done(err);
      });
    });
  });

  it('should clear todos older than 90 days for subscribed users', async (done) => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});

    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 91});
    task.completed = true;
    await task.save();
    await user.save();

    cronMiddleware(req, res, (err) => {
      Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
        expect(secondErr).to.not.exist;
        expect(taskFound).to.not.exist;
        done(err);
      });
    });
  });

  it('should call next if user was not modified after cron', async (done) => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    await user.save();

    cronMiddleware(req, res, (err) => {
      expect(hpBefore).to.equal(user.stats.hp);
      done(err);
    });
  });

  it('updates user.auth.timestamps.loggedin and lastCron', async (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let now = new Date();
    await user.save();

    cronMiddleware(req, res, (err) => {
      expect(moment(now).isSame(user.lastCron, 'day'));
      expect(moment(now).isSame(user.auth.timestamps.loggedin, 'day'));
      done(err);
    });
  });

  it('does damage for missing dailies', async (done) => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    await daily.save();
    await user.save();

    cronMiddleware(req, res, (err) => {
      expect(user.stats.hp).to.be.lessThan(hpBefore);
      done(err);
    });
  });

  it('updates tasks', async (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let todo = generateTodo(user);
    let todoValueBefore = todo.value;
    await user.save();

    cronMiddleware(req, res, () => {
      Tasks.Task.findOne({_id: todo._id}, function (err, todoFound) {
        expect(err).to.not.exist;
        expect(todoFound.value).to.be.lessThan(todoValueBefore);
        done();
      });
    });
  });

  it('applies quest progress', async (done) => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    await daily.save();

    let questKey = 'dilatory';
    user.party.quest.key = questKey;

    let party = new Group({
      type: 'party',
      name: generateUUID(),
      leader: user._id,
    });
    party.quest.members[user._id] = true;
    party.quest.key = questKey;
    await party.save();

    user.party._id = party._id;
    await user.save();

    party.startQuest(user);

    cronMiddleware(req, res, () => {
      expect(user.stats.hp).to.be.lessThan(hpBefore);
      done();
    });
  });

  it('recovers from failed cron and does not error when user is already cronning', async (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    await user.save();

    let updatedUser = cloneDeep(user);
    updatedUser.nMatched = 0;

    sandbox.spy(cronLib, 'recoverCron');

    sandbox.stub(User, 'update')
      .withArgs({ _id: user._id, _cronSignature: 'NOT_RUNNING' })
      .returns({
        exec () {
          return Promise.resolve(updatedUser);
        },
      });

    cronMiddleware(req, res, () => {
      expect(cronLib.recoverCron).to.be.calledOnce;

      done();
    });
  });
});
