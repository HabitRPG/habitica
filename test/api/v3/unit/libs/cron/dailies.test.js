import moment from 'moment';
import nconf from 'nconf';
import requireAgain from 'require-again'; // @TODO: Remove the need for this. Stub a singelton

import { cron } from '../../../../../../website/server/libs/cron';
import * as Tasks from '../../../../../../website/server/models/task';
import { model as User } from '../../../../../../website/server/models/user';
import analytics from '../../../../../../website/server/libs/analyticsService';

let pathToCronLib = '../../../../../../website/server/libs/cron';

describe('dailys', () => {
  let user;
  let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
  let daysMissed = 0;

  beforeEach(() => {
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

    sinon.spy(analytics, 'track');

    let daily = {
      text: 'test daily',
      type: 'daily',
    };

    let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
    tasksByType.dailys = [];
    tasksByType.dailys.push(task);

    user._statsComputed = {
      con: 1,
    };
  });

  afterEach(() => {
    analytics.track.restore();
  });

  describe('completd dailies', () => {
    it('should add history', () => {
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].history).to.be.lengthOf(1);
    });

    it('should set tasks completed to false', () => {
      tasksByType.dailys[0].completed = true;
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].completed).to.be.false;
    });

    it('should reset task checklist for completed dailys', () => {
      tasksByType.dailys[0].checklist.push({title: 'test', completed: false});
      tasksByType.dailys[0].completed = true;
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should reset task checklist for dailys with scheduled misses', () => {
      daysMissed = 10;
      tasksByType.dailys[0].checklist.push({title: 'test', completed: false});
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });
  });

  describe('yesterDailies', () => {
    it('should store dailies that are incomplete', () => {
      daysMissed = 1;
      tasksByType.dailys[0].yesterDaily = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.yesterDailies[0]).to.eql(tasksByType.dailys[0]._id);
    });

    it('should store new dailies that are incomplete in place of the last', () => {
      daysMissed = 1;
      tasksByType.dailys[0].yesterDaily = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});
      expect(user.yesterDailies[0]).to.eql(tasksByType.dailys[0]._id);

      let daily = {
        text: 'test daily',
        type: 'daily',
      };
      let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
      tasksByType.dailys.push(task);
      tasksByType.dailys[0].startDate = moment(new Date()).add({days: 1});
      tasksByType.dailys[1].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});
      expect(user.yesterDailies[0]).to.eql(tasksByType.dailys[1]._id);
    });

    it('should not damage the user', () => {
      let hpBefore = user.stats.hp;
      daysMissed = 1;
      tasksByType.dailys[0].yesterDaily = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.be.equal(hpBefore);
    });
  });

  describe('missed dailies', () => {
    beforeEach(() => {
      tasksByType.dailys[0].yesterDaily = false;
    });

    it('should do damage for missing a daily', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.be.lessThan(hpBefore);
    });

    // This test has moved to the task manager unit test. Leaving it here to confirm
    xit('should not do damage for missing a daily when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      let cronOverride = requireAgain(pathToCronLib).cron;

      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cronOverride({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should not do damage for missing a daily if user stealth buff is greater than or equal to days missed', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      user.stats.buffs.stealth = 2;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      cron({user, tasksByType, daysMissed, analytics});

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should do less damage for missing a daily with partial completion', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});
      cron({user, tasksByType, daysMissed, analytics});
      let hpDifferenceOfFullyIncompleteDaily = hpBefore - user.stats.hp;

      hpBefore = user.stats.hp;
      tasksByType.dailys[0].checklist.push({title: 'test', completed: true});
      tasksByType.dailys[0].checklist.push({title: 'test2', completed: false});
      cron({user, tasksByType, daysMissed, analytics});
      let hpDifferenceOfPartiallyIncompleteDaily = hpBefore - user.stats.hp;

      expect(hpDifferenceOfPartiallyIncompleteDaily).to.be.lessThan(hpDifferenceOfFullyIncompleteDaily);
    });

    it('should decrement quest progress down for missing a daily', () => {
      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({days: 1});

      let progress = cron({user, tasksByType, daysMissed, analytics});

      expect(progress.down).to.equal(-1);
    });
  });
});
