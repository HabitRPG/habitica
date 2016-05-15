import {
  generateRes,
  generateReq,
  generateNext,
  generateTodo,
  generateDaily,
} from '../../../../helpers/api-unit.helper';
import cronMiddleware from '../../../../../website/server/middlewares/api-v3/cron';
import moment from 'moment';
import { model as User } from '../../../../../website/server/models/user';
import { model as Group } from '../../../../../website/server/models/group';
import * as Tasks from '../../../../../website/server/models/task';
import analyticsService from '../../../../../website/server/libs/api-v3/analyticsService';
import { v4 as generateUUID } from 'uuid';

describe('cron middleware', () => {
  let res, req, next;
  let user;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
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

    user._statsComputed = {
      mp: 10,
      maxMP: 100,
    };

    res.locals.user = user;
    res.analytics = analyticsService;
  });

  it('calls next when user is not attached', () => {
    res.locals.user = null;
    cronMiddleware(req, res, next);
    expect(next).to.be.calledOnce;
  });

  it('calls next when days have not been missed', () => {
    cronMiddleware(req, res, next);
    expect(next).to.be.calledOnce;
  });

  it('should clear todos older than 30 days for free users', async (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    await task.save();

    cronMiddleware(req, res, () => {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.not.exist;
        done();
      });
    });
  });

  it('should not clear todos older than 30 days for subscribed users', (done) => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    task.save();

    cronMiddleware(req, res, () => {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.exist;
        done();
      });
    });
  });

  it('should clear todos older than 90 days for subscribed users', (done) => {
    user.purchased.plan.customerId = 'subscribedId';
    user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    user.lastCron = moment(new Date()).subtract({days: 2});

    let task = generateTodo(user);
    task.dateCompleted = moment(new Date()).subtract({days: 91});
    task.completed = true;
    task.save();

    cronMiddleware(req, res, () => {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.not.exist;
        done();
      });
    });
  });

  it('should call next is user was not modified after cron', (done) => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});

    user.save().then(function () {
      cronMiddleware(req, res, function () {
        expect(hpBefore).to.equal(user.stats.hp);
        done();
      });
    });
  });

  it('does damage for missing dailies', (done) => {
    let hpBefore = user.stats.hp;
    user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    daily.save();

    cronMiddleware(req, res, () => {
      expect(user.stats.hp).to.be.lessThan(hpBefore);
      done();
    });
  });

  it('updates tasks', (done) => {
    user.lastCron = moment(new Date()).subtract({days: 2});
    let todo = generateTodo(user);
    let todoValueBefore = todo.value;

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
    daily.save();

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
});
