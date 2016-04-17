import {
  generateRes,
  generateReq,
  generateNext,
  generateTodo,
  generateDaily,
} from '../../../../helpers/api-unit.helper';
import cronMiddleware from '../../../../../website/src/middlewares/api-v3/cron';
import moment from 'moment';
import { model as User } from '../../../../../website/src/models/user';
import { model as Group } from '../../../../../website/src/models/group';
import * as Tasks from '../../../../../website/src/models/task';
import analyticsService from '../../../../../website/src/libs/api-v3/analyticsService';
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

  it('calls next when days have not been missed', () => {
    cronMiddleware(req, res, next);
    expect(next).to.be.calledOnce;
  });

  it('should clear todos older than 30 days for free users', (done) => {
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(res.locals.user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    task.save();

    cronMiddleware(req, res, function callback () {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.not.exist;
        done();
      });
    });
  });

  it('should not clear todos older than 30 days for subscribed users', (done) => {
    res.locals.user.purchased.plan.customerId = 'subscribedId';
    res.locals.user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    let task = generateTodo(res.locals.user);
    task.dateCompleted = moment(new Date()).subtract({days: 31});
    task.completed = true;
    task.save();

    cronMiddleware(req, res, function callback () {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.exist;
        done();
      });
    });
  });

  it('should clear todos older than 90 days for subscribed users', (done) => {
    res.locals.user.purchased.plan.customerId = 'subscribedId';
    res.locals.user.purchased.plan.dateUpdated = moment('012013', 'MMYYYY');
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});

    let task = generateTodo(res.locals.user);
    task.dateCompleted = moment(new Date()).subtract({days: 91});
    task.completed = true;
    task.save();

    cronMiddleware(req, res, function callback () {
      Tasks.Task.findOne({_id: task}, function (err, taskFound) {
        expect(err).to.not.exist;
        expect(taskFound).to.not.exist;
        done();
      });
    });
  });

  it('should call next is user was not modified after cron', (done) => {
    let hpBefore = res.locals.user.stats.hp;
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    generateDaily(res.locals.user);

    cronMiddleware(req, res, function callback () {
      expect(res.locals.user.stats.hp).to.be.equal(hpBefore);
      done();
    });
  });

  it('does damage for missing dailies', (done) => {
    let hpBefore = res.locals.user.stats.hp;
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(res.locals.user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    daily.save();

    cronMiddleware(req, res, function callback () {
      expect(res.locals.user.stats.hp).to.be.lessThan(hpBefore);
      done();
    });
  });

  it('updates tasks', (done) => {
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    let todo = generateTodo(res.locals.user);
    let todoValueBefore = todo.value;

    cronMiddleware(req, res, function callback () {
      Tasks.Task.findOne({_id: todo._id}, function (err, todoFound) {
        expect(err).to.not.exist;
        expect(todoFound.value).to.be.lessThan(todoValueBefore);
        done();
      });
    });
  });

  it('applies quest progress', (done) => {
    let hpBefore = res.locals.user.stats.hp;
    res.locals.user.lastCron = moment(new Date()).subtract({days: 2});
    let daily = generateDaily(res.locals.user);
    daily.startDate = moment(new Date()).subtract({days: 2});
    daily.save();

    let questKey = 'dilatory';
    res.locals.user.party.quest.key = questKey;

    let party = new Group({
      type: 'party',
      name: generateUUID(),
      leader: res.locals.user._id,
    });
    party.quest.members[res.locals.user._id] = true;
    party.quest.key = questKey;
    party.save();

    res.locals.user.party._id = party._id;
    res.locals.user.save();

    party.startQuest(res.locals.user);

    cronMiddleware(req, res, function callback () {
      expect(res.locals.user.stats.hp).to.be.lessThan(hpBefore);
      done();
    });
  });
});
