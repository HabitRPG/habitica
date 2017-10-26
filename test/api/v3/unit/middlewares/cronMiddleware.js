import {
  generateRes,
  generateReq,
  generateTodo,
  generateDaily,
} from '../../../../helpers/api-unit.helper';
import cronMiddleware from '../../../../../website/server/middlewares/cron';
import moment from 'moment';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import * as Tasks from '../../../../../website/server/models/task';
import analyticsService from '../../../../../website/server/libs/analyticsService';
import * as cronLib from '../../../../../website/server/libs/cron';
import { v4 as generateUUID } from 'uuid';

const CRON_TIMEOUT_WAIT = new Date(60 * 60 * 1000).getTime();
const CRON_TIMEOUT_UNIT = new Date(60 * 1000).getTime();

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

  it('should clear todos older than 30 days for free users', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    await task.save();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);

        Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
          if (secondErr) return reject(err);
          expect(secondErr).to.not.exist;
          expect(taskFound).to.not.exist;
          resolve();
        });
      });
    });
  });

  it('should not clear todos older than 30 days for subscribed users', async () => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    await task.save();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
          if (secondErr) return reject(secondErr);
          expect(secondErr).to.not.exist;
          expect(taskFound).to.exist;
          resolve();
        });
      });
    });
  });

  it('should clear todos older than 90 days for subscribed users', async () => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});

    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 91});
    task.completed = true;
    await task.save();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        Tasks.Task.findOne({_id: task}, function (secondErr, taskFound) {
          if (secondErr) return reject(secondErr);
          expect(secondErr).to.not.exist;
          expect(taskFound).to.not.exist;
          resolve();
        });
      });
    });
  });

  it('should call next if user was not modified after cron', async () => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(hpBefore).to.equal(user.stats.hp);
        resolve();
      });
    });
  });

  it('updates user.auth.timestamps.loggedin and lastCron', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let now = new Date();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(moment(now).isSame(user.lastCron, 'day'));
        expect(moment(now).isSame(user.auth.timestamps.loggedin, 'day'));
        resolve();
      });
    });
  });

  it('does damage for missing dailies', async () => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    await daily.save();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(user.stats.hp).to.be.lessThan(hpBefore);
        resolve();
      });
    });
  });

  it('updates tasks', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let todo = generateTodo(user);
    let todoValueBefore = todo.value;
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        Tasks.Task.findOne({_id: todo._id}, function (secondErr, todoFound) {
          if (secondErr) return reject(secondErr);
          expect(todoFound.value).to.be.lessThan(todoValueBefore);
          resolve();
        });
      });
    });
  });

  it('applies quest progress', async () => {
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

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(user.stats.hp).to.be.lessThan(hpBefore);
        resolve();
      });
    });
  });

  it('recovers from failed cron and does not error when user is already cronning', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    await user.save();

    let updatedUser = user.toObject();
    updatedUser.nMatched = 0;

    sandbox.spy(cronLib, 'recoverCron');

    sandbox.stub(User, 'update')
      .withArgs({
        _id: user._id,
        $or: [
          {_cronSignature: 'NOT_RUNNING'},
          {_cronSignature: {$lt: sinon.match.number}},
        ],
      })
      .returns({
        exec () {
          return Promise.resolve(updatedUser);
        },
      });

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(cronLib.recoverCron).to.be.calledOnce;

        resolve();
      });
    });
  });

  it('cronSignature less than an hour ago should error', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let now = new Date();
    await User.update({
      _id: user._id,
    }, {
      $set: {
        _cronSignature: now.getTime() - CRON_TIMEOUT_WAIT + CRON_TIMEOUT_UNIT,
      },
    }).exec();
    await user.save();
    let expectedErrMessage = `Impossible to recover from cron for user ${user._id}.`;

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (!err) return reject(new Error('Cron should have failed.'));
        expect(err.message).to.be.equal(expectedErrMessage);
        resolve();
      });
    });
  });

  it('cronSignature longer than an hour ago should allow cron', async () => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let now = new Date();
    await User.update({
      _id: user._id,
    }, {
      $set: {
        _cronSignature: now.getTime() - CRON_TIMEOUT_WAIT - CRON_TIMEOUT_UNIT,
      },
    }).exec();
    await user.save();

    await new Promise((resolve, reject) => {
      cronMiddleware(req, res, (err) => {
        if (err) return reject(err);
        expect(moment(now).isSame(user.auth.timestamps.loggedin, 'day'));
        expect(user._cronSignature).to.be.equal('NOT_RUNNING');
        resolve();
      });
    });
  });
});
