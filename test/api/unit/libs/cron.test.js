/* eslint-disable global-require */
import moment from 'moment';
import nconf from 'nconf';
import requireAgain from 'require-again';
import { recoverCron, cron } from '../../../../website/server/libs/cron';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';
import common from '../../../../website/common';
import * as analytics from '../../../../website/server/libs/analyticsService';

// const scoreTask = common.ops.scoreTask;

const pathToCronLib = '../../../../website/server/libs/cron';

describe('cron', () => {
  let clock = null;
  let user;
  const tasksByType = {
    habits: [], dailys: [], todos: [], rewards: [],
  };
  let daysMissed = 0;

  beforeEach(() => {
    user = new User({
      auth: {
        local: {
          username: 'username',
          lowerCaseUsername: 'username',
          email: 'email@example.com',
          salt: 'salt',
          hashed_password: 'hashed_password', // eslint-disable-line camelcase
        },
      },
    });

    sinon.spy(analytics, 'track');
  });

  afterEach(() => {
    if (clock !== null) clock.restore();
    analytics.track.restore();
  });

  it('updates user.preferences.timezoneOffsetAtLastCron', () => {
    const timezoneUtcOffsetFromUserPrefs = -1;

    cron({
      user, tasksByType, daysMissed, analytics, timezoneUtcOffsetFromUserPrefs,
    });

    expect(user.preferences.timezoneOffsetAtLastCron).to.equal(1);
  });

  it('resets user.items.lastDrop.count', () => {
    user.items.lastDrop.count = 4;
    cron({
      user, tasksByType, daysMissed, analytics,
    });
    expect(user.items.lastDrop.count).to.equal(0);
  });

  it('increments user cron count', () => {
    const cronCountBefore = user.flags.cronCount;
    cron({
      user, tasksByType, daysMissed, analytics,
    });
    expect(user.flags.cronCount).to.be.greaterThan(cronCountBefore);
  });

  it('calls analytics', () => {
    cron({
      user, tasksByType, daysMissed, analytics,
    });
    expect(analytics.track.callCount).to.equal(1);
  });

  it('calls analytics when user is sleeping', () => {
    user.preferences.sleep = true;
    cron({
      user, tasksByType, daysMissed, analytics,
    });
    expect(analytics.track.callCount).to.equal(1);
  });

  describe('end of the month perks', () => {
    beforeEach(() => {
      user.purchased.plan.customerId = 'subscribedId';
      user.purchased.plan.dateUpdated = moment().subtract(1, 'months').toDate();
    });

    it('awards current mystery items to subscriber', () => {
      user.purchased.plan.dateUpdated = new Date('2018-12-11');
      clock = sinon.useFakeTimers(new Date('2019-01-29'));
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.mysteryItems.length).to.eql(2);
      const filteredNotifications = user.notifications.filter(n => n.type === 'NEW_MYSTERY_ITEMS');
      expect(filteredNotifications.length).to.equal(1);
    });

    it('awards multiple mystery item sets if user skipped months between logins', () => {
      user.purchased.plan.dateUpdated = new Date('2018-11-11');
      clock = sinon.useFakeTimers(new Date('2019-01-29'));
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.mysteryItems.length).to.eql(4);
      const filteredNotifications = user.notifications.filter(n => n.type === 'NEW_MYSTERY_ITEMS');
      expect(filteredNotifications.length).to.equal(1);
    });

    it('resets plan.gemsBought on a new month', () => {
      user.purchased.plan.gemsBought = 10;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.gemsBought).to.equal(0);
    });

    it('resets plan.gemsBought on a new month if user does not have purchased.plan.dateUpdated', () => {
      user.purchased.plan.gemsBought = 10;
      user.purchased.plan.dateUpdated = undefined;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.gemsBought).to.equal(0);
    });

    it('does not reset plan.gemsBought within the month', () => {
      clock = sinon.useFakeTimers(moment().startOf('month').add(2, 'days').toDate());
      user.purchased.plan.dateUpdated = moment().startOf('month').toDate();

      user.purchased.plan.gemsBought = 10;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.gemsBought).to.equal(10);
    });

    it('resets plan.dateUpdated on a new month', () => {
      const currentMonth = moment().startOf('month');
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(moment(user.purchased.plan.dateUpdated).startOf('month').isSame(currentMonth)).to.eql(true);
    });

    it('increments plan.consecutive.count', () => {
      user.purchased.plan.consecutive.count = 0;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.count).to.equal(1);
    });

    it('increments plan.consecutive.count by more than 1 if user skipped months between logins', () => {
      user.purchased.plan.dateUpdated = moment().subtract(2, 'months').toDate();
      user.purchased.plan.consecutive.count = 0;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.count).to.equal(2);
    });

    it('decrements plan.consecutive.offset when offset is greater than 0', () => {
      user.purchased.plan.consecutive.offset = 2;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.offset).to.equal(1);
    });

    it('does not award unearned plan.consecutive.trinkets if subscription ended during an absence', () => {
      user.purchased.plan.dateUpdated = moment().subtract(6, 'months').toDate();
      user.purchased.plan.dateTerminated = moment().subtract(3, 'months').toDate();
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.trinkets = 1;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.purchased.plan.consecutive.trinkets).to.equal(1);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached the gemCap limit', () => {
      user.purchased.plan.consecutive.gemCapExtra = 25;
      user.purchased.plan.consecutive.count = 5;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(25);
    });

    it('does not reset plan stats if we are before the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).add({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.customerId).to.exist;
    });

    it('does reset plan stats if we are after the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).subtract({ days: 1 });
      user.purchased.plan.consecutive.gemCapExtra = 20;
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.purchased.plan.customerId).to.not.exist;
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(0);
      expect(user.purchased.plan.consecutive.count).to.equal(0);
      expect(user.purchased.plan.consecutive.offset).to.equal(0);
    });

    describe('for a 1-month recurring subscription', () => {
      // create a user that will be used for all of these tests without a reset before each
      const user1 = new User({
        auth: {
          local: {
            username: 'username1',
            lowerCaseUsername: 'username1',
            email: 'email1@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user1 has a 1-month recurring subscription starting today
      user1.purchased.plan.customerId = 'subscribedId';
      user1.purchased.plan.dateUpdated = moment().toDate();
      user1.purchased.plan.planId = 'basic';
      user1.purchased.plan.consecutive.count = 0;
      user1.purchased.plan.consecutive.offset = 0;
      user1.purchased.plan.consecutive.trinkets = 0;
      user1.purchased.plan.consecutive.gemCapExtra = 0;

      it('does not increment consecutive benefits after the first month', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        // Add 1 month to simulate what happens a month after the subscription was created.
        // Add 2 days so that we're sure we're not affected by any start-of-month effects
        // e.g., from time zone oddness.
        cron({
          user: user1, tasksByType, daysMissed, analytics,
        });
        expect(user1.purchased.plan.consecutive.count).to.equal(1);
        expect(user1.purchased.plan.consecutive.offset).to.equal(0);
        expect(user1.purchased.plan.consecutive.trinkets).to.equal(0);
        expect(user1.purchased.plan.consecutive.gemCapExtra).to.equal(0);
      });

      it('does not increment consecutive benefits after the second month', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(2, 'months')
          .add(2, 'days')
          .toDate());
        // Add 1 month to simulate what happens a month after the subscription was created.
        // Add 2 days so that we're sure we're not affected by any start-of-month effects
        // e.g., from time zone oddness.
        cron({
          user: user1, tasksByType, daysMissed, analytics,
        });
        expect(user1.purchased.plan.consecutive.count).to.equal(2);
        expect(user1.purchased.plan.consecutive.offset).to.equal(0);
        expect(user1.purchased.plan.consecutive.trinkets).to.equal(0);
        expect(user1.purchased.plan.consecutive.gemCapExtra).to.equal(0);
      });

      it('increments consecutive benefits after the third month', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(3, 'months')
          .add(2, 'days')
          .toDate());
        // Add 1 month to simulate what happens a month after the subscription was created.
        // Add 2 days so that we're sure we're not affected by any start-of-month effects
        // e.g., from time zone oddness.
        cron({
          user: user1, tasksByType, daysMissed, analytics,
        });
        expect(user1.purchased.plan.consecutive.count).to.equal(3);
        expect(user1.purchased.plan.consecutive.offset).to.equal(0);
        expect(user1.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user1.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits after the fourth month', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(4, 'months')
          .add(2, 'days')
          .toDate());
        // Add 1 month to simulate what happens a month after the subscription was created.
        // Add 2 days so that we're sure we're not affected by any start-of-month effects
        // e.g., from time zone oddness.
        cron({
          user: user1, tasksByType, daysMissed, analytics,
        });
        expect(user1.purchased.plan.consecutive.count).to.equal(4);
        expect(user1.purchased.plan.consecutive.offset).to.equal(0);
        expect(user1.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user1.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('increments consecutive benefits correctly if user has been absent with continuous subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(10, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user1, tasksByType, daysMissed, analytics,
        });
        expect(user1.purchased.plan.consecutive.count).to.equal(10);
        expect(user1.purchased.plan.consecutive.offset).to.equal(0);
        expect(user1.purchased.plan.consecutive.trinkets).to.equal(3);
        expect(user1.purchased.plan.consecutive.gemCapExtra).to.equal(15);
      });
    });

    describe('for a 3-month recurring subscription', () => {
      const user3 = new User({
        auth: {
          local: {
            username: 'username3',
            lowerCaseUsername: 'username3',
            email: 'email3@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user3 has a 3-month recurring subscription starting today
      user3.purchased.plan.customerId = 'subscribedId';
      user3.purchased.plan.dateUpdated = moment().toDate();
      user3.purchased.plan.planId = 'basic_3mo';
      user3.purchased.plan.consecutive.count = 0;
      user3.purchased.plan.consecutive.offset = 3;
      user3.purchased.plan.consecutive.trinkets = 1;
      user3.purchased.plan.consecutive.gemCapExtra = 5;

      it('does not increment consecutive benefits in the first month of the first paid period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(1);
        expect(user3.purchased.plan.consecutive.offset).to.equal(2);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits in the middle of the period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(2, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(2);
        expect(user3.purchased.plan.consecutive.offset).to.equal(1);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits in the final month of the period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(3, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(3);
        expect(user3.purchased.plan.consecutive.offset).to.equal(0);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('increments consecutive benefits the month after the second paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(4, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(4);
        expect(user3.purchased.plan.consecutive.offset).to.equal(2);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(2);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(10);
      });

      it('does not increment consecutive benefits in the second month of the second period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(5, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(5);
        expect(user3.purchased.plan.consecutive.offset).to.equal(1);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(2);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(10);
      });

      it('does not increment consecutive benefits in the final month of the second period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(6, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(6);
        expect(user3.purchased.plan.consecutive.offset).to.equal(0);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(2);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(10);
      });

      it('increments consecutive benefits the month after the third paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(7, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(7);
        expect(user3.purchased.plan.consecutive.offset).to.equal(2);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(3);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(15);
      });

      it('increments consecutive benefits correctly if user has been absent with continuous subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(10, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3, tasksByType, daysMissed, analytics,
        });
        expect(user3.purchased.plan.consecutive.count).to.equal(10);
        expect(user3.purchased.plan.consecutive.offset).to.equal(2);
        expect(user3.purchased.plan.consecutive.trinkets).to.equal(4);
        expect(user3.purchased.plan.consecutive.gemCapExtra).to.equal(20);
      });
    });

    describe('for a 6-month recurring subscription', () => {
      const user6 = new User({
        auth: {
          local: {
            username: 'username6',
            lowerCaseUsername: 'username6',
            email: 'email6@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user6 has a 6-month recurring subscription starting today
      user6.purchased.plan.customerId = 'subscribedId';
      user6.purchased.plan.dateUpdated = moment().toDate();
      user6.purchased.plan.planId = 'google_6mo';
      user6.purchased.plan.consecutive.count = 0;
      user6.purchased.plan.consecutive.offset = 6;
      user6.purchased.plan.consecutive.trinkets = 2;
      user6.purchased.plan.consecutive.gemCapExtra = 10;

      it('does not increment consecutive benefits in the first month of the first paid period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6, tasksByType, daysMissed, analytics,
        });
        expect(user6.purchased.plan.consecutive.count).to.equal(1);
        expect(user6.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6.purchased.plan.consecutive.trinkets).to.equal(2);
        expect(user6.purchased.plan.consecutive.gemCapExtra).to.equal(10);
      });

      it('does not increment consecutive benefits in the final month of the period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(6, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6, tasksByType, daysMissed, analytics,
        });
        expect(user6.purchased.plan.consecutive.count).to.equal(6);
        expect(user6.purchased.plan.consecutive.offset).to.equal(0);
        expect(user6.purchased.plan.consecutive.trinkets).to.equal(2);
        expect(user6.purchased.plan.consecutive.gemCapExtra).to.equal(10);
      });

      it('increments consecutive benefits the month after the second paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(7, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6, tasksByType, daysMissed, analytics,
        });
        expect(user6.purchased.plan.consecutive.count).to.equal(7);
        expect(user6.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6.purchased.plan.consecutive.trinkets).to.equal(4);
        expect(user6.purchased.plan.consecutive.gemCapExtra).to.equal(20);
      });

      it('increments consecutive benefits the month after the third paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(13, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6, tasksByType, daysMissed, analytics,
        });
        expect(user6.purchased.plan.consecutive.count).to.equal(13);
        expect(user6.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6.purchased.plan.consecutive.trinkets).to.equal(6);
        expect(user6.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('increments consecutive benefits correctly if user has been absent with continuous subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(19, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6, tasksByType, daysMissed, analytics,
        });
        expect(user6.purchased.plan.consecutive.count).to.equal(19);
        expect(user6.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6.purchased.plan.consecutive.trinkets).to.equal(8);
        expect(user6.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });
    });

    describe('for a 12-month recurring subscription', () => {
      const user12 = new User({
        auth: {
          local: {
            username: 'username12',
            lowerCaseUsername: 'username12',
            email: 'email12@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user12 has a 12-month recurring subscription starting today
      user12.purchased.plan.customerId = 'subscribedId';
      user12.purchased.plan.dateUpdated = moment().toDate();
      user12.purchased.plan.planId = 'basic_12mo';
      user12.purchased.plan.consecutive.count = 0;
      user12.purchased.plan.consecutive.offset = 12;
      user12.purchased.plan.consecutive.trinkets = 4;
      user12.purchased.plan.consecutive.gemCapExtra = 20;

      it('does not increment consecutive benefits in the first month of the first paid period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user12, tasksByType, daysMissed, analytics,
        });
        expect(user12.purchased.plan.consecutive.count).to.equal(1);
        expect(user12.purchased.plan.consecutive.offset).to.equal(11);
        expect(user12.purchased.plan.consecutive.trinkets).to.equal(4);
        expect(user12.purchased.plan.consecutive.gemCapExtra).to.equal(20);
      });

      it('does not increment consecutive benefits in the final month of the period that they already have benefits for', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(12, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user12, tasksByType, daysMissed, analytics,
        });
        expect(user12.purchased.plan.consecutive.count).to.equal(12);
        expect(user12.purchased.plan.consecutive.offset).to.equal(0);
        expect(user12.purchased.plan.consecutive.trinkets).to.equal(4);
        expect(user12.purchased.plan.consecutive.gemCapExtra).to.equal(20);
      });

      it('increments consecutive benefits the month after the second paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(13, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user12, tasksByType, daysMissed, analytics,
        });
        expect(user12.purchased.plan.consecutive.count).to.equal(13);
        expect(user12.purchased.plan.consecutive.offset).to.equal(11);
        expect(user12.purchased.plan.consecutive.trinkets).to.equal(8);
        expect(user12.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('increments consecutive benefits the month after the third paid period has started', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(25, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user12, tasksByType, daysMissed, analytics,
        });
        expect(user12.purchased.plan.consecutive.count).to.equal(25);
        expect(user12.purchased.plan.consecutive.offset).to.equal(11);
        expect(user12.purchased.plan.consecutive.trinkets).to.equal(12);
        expect(user12.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('increments consecutive benefits correctly if user has been absent with continuous subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(37, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user12, tasksByType, daysMissed, analytics,
        });
        expect(user12.purchased.plan.consecutive.count).to.equal(37);
        expect(user12.purchased.plan.consecutive.offset).to.equal(11);
        expect(user12.purchased.plan.consecutive.trinkets).to.equal(16);
        expect(user12.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });
    });

    describe('for a 3-month gift subscription (non-recurring)', () => {
      const user3g = new User({
        auth: {
          local: {
            username: 'username3g',
            lowerCaseUsername: 'username3g',
            email: 'email3g@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user3g has a 3-month gift subscription starting today
      user3g.purchased.plan.customerId = 'Gift';
      user3g.purchased.plan.dateUpdated = moment().toDate();
      user3g.purchased.plan.dateTerminated = moment().startOf('month').add(3, 'months').add(15, 'days')
        .toDate();
      user3g.purchased.plan.planId = null;
      user3g.purchased.plan.consecutive.count = 0;
      user3g.purchased.plan.consecutive.offset = 3;
      user3g.purchased.plan.consecutive.trinkets = 1;
      user3g.purchased.plan.consecutive.gemCapExtra = 5;

      it('does not increment consecutive benefits in the first month of the gift subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3g, tasksByType, daysMissed, analytics,
        });
        expect(user3g.purchased.plan.consecutive.count).to.equal(1);
        expect(user3g.purchased.plan.consecutive.offset).to.equal(2);
        expect(user3g.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3g.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits in the second month of the gift subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(2, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3g, tasksByType, daysMissed, analytics,
        });
        expect(user3g.purchased.plan.consecutive.count).to.equal(2);
        expect(user3g.purchased.plan.consecutive.offset).to.equal(1);
        expect(user3g.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3g.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits in the third month of the gift subscription', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(3, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3g, tasksByType, daysMissed, analytics,
        });
        expect(user3g.purchased.plan.consecutive.count).to.equal(3);
        expect(user3g.purchased.plan.consecutive.offset).to.equal(0);
        expect(user3g.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3g.purchased.plan.consecutive.gemCapExtra).to.equal(5);
      });

      it('does not increment consecutive benefits in the month after the gift subscription has ended', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(4, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user3g, tasksByType, daysMissed, analytics,
        });
        // subscription has been erased by now
        expect(user3g.purchased.plan.consecutive.count).to.equal(0);
        expect(user3g.purchased.plan.consecutive.offset).to.equal(0);
        expect(user3g.purchased.plan.consecutive.trinkets).to.equal(1);
        expect(user3g.purchased.plan.consecutive.gemCapExtra).to.equal(0); // erased
      });
    });

    describe('for a 6-month recurring subscription where the user has incorrect consecutive month data from prior bugs', () => {
      const user6x = new User({
        auth: {
          local: {
            username: 'username6x',
            lowerCaseUsername: 'username6x',
            email: 'email6x@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      });
      // user6x has a 6-month recurring subscription starting 8 months in the past
      // before issue #4819 was fixed
      user6x.purchased.plan.customerId = 'subscribedId';
      user6x.purchased.plan.dateUpdated = moment().toDate();
      user6x.purchased.plan.planId = 'basic_6mo';
      user6x.purchased.plan.consecutive.count = 8;
      user6x.purchased.plan.consecutive.offset = 0;
      user6x.purchased.plan.consecutive.trinkets = 3;
      user6x.purchased.plan.consecutive.gemCapExtra = 15;

      it('increments consecutive benefits in the first month since the fix for #4819 goes live', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(1, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6x, tasksByType, daysMissed, analytics,
        });
        expect(user6x.purchased.plan.consecutive.count).to.equal(9);
        expect(user6x.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6x.purchased.plan.consecutive.trinkets).to.equal(5);
        expect(user6x.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('does not increment consecutive benefits in the second month after the fix goes live', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(2, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6x, tasksByType, daysMissed, analytics,
        });
        expect(user6x.purchased.plan.consecutive.count).to.equal(10);
        expect(user6x.purchased.plan.consecutive.offset).to.equal(4);
        expect(user6x.purchased.plan.consecutive.trinkets).to.equal(5);
        expect(user6x.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('does not increment consecutive benefits in the third month after the fix goes live', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(3, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6x, tasksByType, daysMissed, analytics,
        });
        expect(user6x.purchased.plan.consecutive.count).to.equal(11);
        expect(user6x.purchased.plan.consecutive.offset).to.equal(3);
        expect(user6x.purchased.plan.consecutive.trinkets).to.equal(5);
        expect(user6x.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });

      it('increments consecutive benefits in the seventh month after the fix goes live', () => {
        clock = sinon.useFakeTimers(moment().utcOffset(0).startOf('month').add(7, 'months')
          .add(2, 'days')
          .toDate());
        cron({
          user: user6x, tasksByType, daysMissed, analytics,
        });
        expect(user6x.purchased.plan.consecutive.count).to.equal(15);
        expect(user6x.purchased.plan.consecutive.offset).to.equal(5);
        expect(user6x.purchased.plan.consecutive.trinkets).to.equal(7);
        expect(user6x.purchased.plan.consecutive.gemCapExtra).to.equal(25);
      });
    });
  });

  describe('end of the month perks when user is not subscribed', () => {
    beforeEach(() => {
      user.purchased.plan.dateUpdated = moment().subtract(1, 'months').toDate();
    });

    it('resets plan.gemsBought on a new month', () => {
      user.purchased.plan.gemsBought = 10;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.gemsBought).to.equal(0);
    });

    it('does not reset plan.gemsBought within the month', () => {
      clock = sinon.useFakeTimers(moment().startOf('month').add(2, 'days').unix());
      user.purchased.plan.dateUpdated = moment().startOf('month').toDate();

      user.purchased.plan.gemsBought = 10;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.gemsBought).to.equal(10);
    });

    it('does not reset plan.dateUpdated on a new month', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.dateUpdated).to.be.empty;
    });

    it('does not increment plan.consecutive.count', () => {
      user.purchased.plan.consecutive.count = 0;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.count).to.equal(0);
    });

    it('does not decrement plan.consecutive.offset when offset is greater than 0', () => {
      user.purchased.plan.consecutive.offset = 1;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.offset).to.equal(1);
    });

    it('does not increment plan.consecutive.trinkets when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.trinkets).to.equal(0);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached a month that is a multiple of 3', () => {
      user.purchased.plan.consecutive.count = 5;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(0);
    });

    it('does not increment plan.consecutive.gemCapExtra when user has reached the gemCap limit', () => {
      user.purchased.plan.consecutive.gemCapExtra = 25;
      user.purchased.plan.consecutive.count = 5;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.consecutive.gemCapExtra).to.equal(25);
    });

    it('does nothing to plan stats if we are before the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).add({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.purchased.plan.customerId).to.not.exist;
    });

    xit('does nothing to plan stats when we are after the last day of the cancelled month', () => {
      user.purchased.plan.dateTerminated = moment(new Date()).subtract({ days: 1 });
      user.purchased.plan.consecutive.gemCapExtra = 20;
      user.purchased.plan.consecutive.count = 5;
      user.purchased.plan.consecutive.offset = 1;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.purchased.plan.customerId).to.exist;
      expect(user.purchased.plan.consecutive.gemCapExtra).to.exist;
      expect(user.purchased.plan.consecutive.count).to.exist;
      expect(user.purchased.plan.consecutive.offset).to.exist;
    });
  });

  describe('todos', () => {
    beforeEach(() => {
      const todo = {
        text: 'test todo',
        type: 'todo',
        value: 0,
      };

      const task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
      tasksByType.todos.push(task);
    });

    afterEach(() => {
      tasksByType.todos = [];
      user.tasksOrder.todos = [];
    });

    it('should make uncompleted todos redder', () => {
      const valueBefore = tasksByType.todos[0].value;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.todos[0].value).to.be.lessThan(valueBefore);
    });

    it('should not make completed todos redder', () => {
      tasksByType.todos[0].completed = true;
      const valueBefore = tasksByType.todos[0].value;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.todos[0].value).to.equal(valueBefore);
    });

    it('should add history of completed todos to user history', () => {
      tasksByType.todos[0].completed = true;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.history.todos).to.be.lengthOf(1);
    });

    it('should remove completed todos from users taskOrder list', () => {
      const todo = {
        text: 'test todo',
        type: 'todo',
        value: 0,
      };

      const task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
      tasksByType.todos.push(task);
      tasksByType.todos[0].completed = true;

      user.tasksOrder.todos = tasksByType.todos.map(taskTodo => taskTodo._id);
      // Since ideally tasksByType should not contain completed todos,
      // fake ids should be filtered too
      user.tasksOrder.todos.push('00000000-0000-0000-0000-000000000000');

      expect(tasksByType.todos).to.be.lengthOf(2);
      expect(user.tasksOrder.todos).to.be.lengthOf(3);

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      // user.tasksOrder.todos should be filtered while tasks by type remains unchanged
      expect(tasksByType.todos).to.be.lengthOf(2);
      expect(user.tasksOrder.todos).to.be.lengthOf(1);
    });

    it('should preserve todos order in task list', () => {
      const todo = {
        text: 'test todo',
        type: 'todo',
        value: 0,
      };

      let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
      tasksByType.todos.push(task);
      task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
      tasksByType.todos.push(task);
      task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line new-cap
      tasksByType.todos.push(task);

      // Set up user.tasksOrder list in a specific order
      user.tasksOrder.todos = tasksByType.todos.map(todoTask => todoTask._id).reverse();
      const original = user.tasksOrder.todos; // Preserve the original order

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      let listsAreEqual = true;
      user.tasksOrder.todos.forEach((taskId, index) => {
        if (original[index]._id !== taskId) {
          listsAreEqual = false;
        }
      });

      expect(listsAreEqual);
      expect(user.tasksOrder.todos).to.be.lengthOf(original.length);
    });
  });

  describe('dailys', () => {
    beforeEach(() => {
      const daily = {
        text: 'test daily',
        type: 'daily',
      };

      const task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { con: 1 }));
    });

    afterEach(() => {
      common.statsComputed.restore();
    });

    it('computes isDue', () => {
      tasksByType.dailys[0].frequency = 'daily';
      tasksByType.dailys[0].everyX = 5;
      tasksByType.dailys[0].startDate = moment().add(1, 'days').toDate();
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].isDue).to.be.false;
    });

    it('computes isDue when user is sleeping', () => {
      user.preferences.sleep = true;
      tasksByType.dailys[0].frequency = 'daily';
      tasksByType.dailys[0].everyX = 5;
      tasksByType.dailys[0].startDate = moment().toDate();
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].isDue).to.exist;
    });

    it('computes nextDue', () => {
      tasksByType.dailys[0].frequency = 'daily';
      tasksByType.dailys[0].everyX = 5;
      tasksByType.dailys[0].startDate = moment().add(1, 'days').toDate();
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].nextDue.length).to.eql(6);
    });

    it('should add history', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].history).to.be.lengthOf(1);
    });

    it('should set tasks completed to false', () => {
      tasksByType.dailys[0].completed = true;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].completed).to.be.false;
    });

    it('should set tasks completed to false when user is sleeping', () => {
      user.preferences.sleep = true;
      tasksByType.dailys[0].completed = true;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].completed).to.be.false;
    });

    it('should reset task checklist for completed dailys', () => {
      tasksByType.dailys[0].checklist.push({ title: 'test', completed: false });
      tasksByType.dailys[0].completed = true;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should reset task checklist for completed dailys when user is sleeping', () => {
      user.preferences.sleep = true;
      tasksByType.dailys[0].checklist.push({ title: 'test', completed: false });
      tasksByType.dailys[0].completed = true;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should reset task checklist for dailys with scheduled misses', () => {
      daysMissed = 10;
      tasksByType.dailys[0].checklist.push({ title: 'test', completed: false });
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(tasksByType.dailys[0].checklist[0].completed).to.be.false;
    });

    it('should do damage for missing a daily', () => {
      daysMissed = 1;
      const hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.stats.hp).to.be.lessThan(hpBefore);
    });

    it('should not do damage for missing a daily when user is sleeping', () => {
      user.preferences.sleep = true;
      daysMissed = 1;
      const hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should not do damage for missing a daily when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      const cronOverride = requireAgain(pathToCronLib).cron;

      daysMissed = 1;
      const hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      cronOverride({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should not do damage for missing a daily if user stealth buff is greater than or equal to days missed', () => {
      daysMissed = 1;
      const hpBefore = user.stats.hp;
      user.stats.buffs.stealth = 2;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should do less damage for missing a daily with partial completion', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      const hpDifferenceOfFullyIncompleteDaily = hpBefore - user.stats.hp;

      hpBefore = user.stats.hp;
      tasksByType.dailys[0].checklist.push({ title: 'test', completed: true });
      tasksByType.dailys[0].checklist.push({ title: 'test2', completed: false });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      const hpDifferenceOfPartiallyIncompleteDaily = hpBefore - user.stats.hp;

      expect(hpDifferenceOfPartiallyIncompleteDaily)
        .to.be.lessThan(hpDifferenceOfFullyIncompleteDaily);
    });

    it('should decrement quest.progress.down for missing a daily', () => {
      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const progress = cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(progress.down).to.equal(-1);
    });

    it('should not decrement quest.progress.down for missing a daily when user is sleeping', () => {
      user.preferences.sleep = true;
      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const progress = cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(progress.down).to.equal(0);
    });

    it('should do damage for only yesterday\'s dailies', () => {
      daysMissed = 3;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const daily = {
        text: 'test daily',
        type: 'daily',
      };
      const task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
      tasksByType.dailys.push(task);
      tasksByType.dailys[1].startDate = moment(new Date()).subtract({ days: 2 });
      tasksByType.dailys[1].everyX = 2;
      tasksByType.dailys[1].frequency = 'daily';

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.hp).to.equal(48);
    });
  });

  describe('habits', () => {
    beforeEach(() => {
      const habit = {
        text: 'test habit',
        type: 'habit',
      };

      const task = new Tasks.habit(Tasks.Task.sanitize(habit)); // eslint-disable-line new-cap
      tasksByType.habits = [];
      tasksByType.habits.push(task);
    });

    it('should decrement only up value', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].down = false;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(tasksByType.habits[0].value).to.be.lessThan(1);
    });

    it('should decrement only down value', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].up = false;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(tasksByType.habits[0].value).to.be.lessThan(1);
    });

    it('should do nothing to habits with both up and down', () => {
      tasksByType.habits[0].value = 1;
      tasksByType.habits[0].up = true;
      tasksByType.habits[0].down = true;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(tasksByType.habits[0].value).to.equal(1);
    });

    describe('counters', () => {
      const notStartOfWeekOrMonth = new Date(2016, 9, 28).getTime(); // a Friday

      beforeEach(() => {
        // Replace system clocks so we can get predictable results
        clock = sinon.useFakeTimers(notStartOfWeekOrMonth);
      });

      it('should reset a daily habit counter each day', () => {
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;

        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should reset habit counters even if user is sleeping', () => {
        user.preferences.sleep = true;
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;

        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should reset a weekly habit counter each Monday', () => {
        tasksByType.habits[0].frequency = 'weekly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);

        // should reset
        daysMissed = 8;
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should reset a weekly habit counter with custom daily start', () => {
        clock.restore();

        // Server clock: Monday 12am UTC
        let monday = new Date('May 22, 2017 00:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // cron runs at 2am
        user.preferences.dayStart = 2;

        tasksByType.habits[0].frequency = 'weekly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);

        clock.restore();

        // Server clock: Monday 3am UTC
        monday = new Date('May 22, 2017 03:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // should reset after user CDS
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should not reset a weekly habit counter when server tz is Monday but user\'s tz is Tuesday', () => {
        clock.restore();

        // Server clock: Monday 11pm UTC
        const monday = new Date('May 22, 2017 23:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // User clock: Tuesday 1am UTC + 2
        user.preferences.timezoneOffset = -120;

        tasksByType.habits[0].frequency = 'weekly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);

        // User missed one cron, which will subtract User clock back to Monday 1am UTC + 2
        // should reset
        daysMissed = 2;
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should reset a weekly habit counter when server tz is Sunday but user\'s tz is Monday', () => {
        clock.restore();

        // Server clock: Sunday 11pm UTC
        const sunday = new Date('May 21, 2017 23:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(sunday);

        // User clock: Monday 2am UTC + 3
        user.preferences.timezoneOffset = -180;

        tasksByType.habits[0].frequency = 'weekly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should not reset a weekly habit counter when server tz is Monday but user\'s tz is Sunday', () => {
        clock.restore();

        // Server clock: Monday 2am UTC
        const monday = new Date('May 22, 2017 02:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // User clock: Sunday 11pm UTC - 3
        user.preferences.timezoneOffset = 180;

        tasksByType.habits[0].frequency = 'weekly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);
      });

      it('should reset a monthly habit counter the first day of each month', () => {
        tasksByType.habits[0].frequency = 'monthly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);

        // should reset
        daysMissed = 32;
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should reset a monthly habit counter when server tz is last day of month but user tz is first day of the month', () => {
        clock.restore();
        daysMissed = 0;

        // Server clock: 4/30/17 11pm UTC
        const monday = new Date('April 30, 2017 23:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // User clock: 5/1/17 2am UTC + 3
        user.preferences.timezoneOffset = -180;

        tasksByType.habits[0].frequency = 'monthly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });

      it('should not reset a monthly habit counter when server tz is first day of month but user tz is 2nd day of the month', () => {
        clock.restore();

        // Server clock: 5/1/17 11pm UTC
        const monday = new Date('May 1, 2017 23:00:00 GMT').getTime();
        clock = sinon.useFakeTimers(monday);

        // User clock: 5/2/17 2am UTC + 3
        user.preferences.timezoneOffset = -180;

        tasksByType.habits[0].frequency = 'monthly';
        tasksByType.habits[0].counterUp = 1;
        tasksByType.habits[0].counterDown = 1;
        daysMissed = 1;

        // should not reset
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(1);
        expect(tasksByType.habits[0].counterDown).to.equal(1);

        // User missed one day, which will subtract User clock back to 5/1/17 2am UTC + 3
        // should reset
        daysMissed = 2;
        cron({
          user, tasksByType, daysMissed, analytics,
        });

        expect(tasksByType.habits[0].counterUp).to.equal(0);
        expect(tasksByType.habits[0].counterDown).to.equal(0);
      });
    });
  });

  describe('perfect day', () => {
    beforeEach(() => {
      const daily = {
        text: 'test daily',
        type: 'daily',
      };

      const task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { con: 1 }));
    });

    afterEach(() => {
      common.statsComputed.restore();
    });

    it('stores a new entry in user.history.exp', () => {
      user.stats.lvl = 2;

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.history.exp).to.have.lengthOf(1);
      expect(user.history.exp[0].value).to.equal(25);
    });

    it('increments perfect day achievement if all (at least 1) due dailies were completed', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.achievements.perfect).to.equal(1);
    });

    it('does not increment perfect day achievement if no due dailies', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).add({ days: 1 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.achievements.perfect).to.equal(0);
    });

    it('gives perfect day buff if all (at least 1) due dailies were completed', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const previousBuffs = user.stats.buffs.toObject();

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });

    it('gives perfect day buff if all (at least 1) due dailies were completed when user is sleeping', () => {
      user.preferences.sleep = true;
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const previousBuffs = user.stats.buffs.toObject();

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });

    it('clears buffs if user does not have a perfect day (no due dailys)', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).add({ days: 1 });

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('clears buffs if user does not have a perfect day (no due dailys) when user is sleeping', () => {
      user.preferences.sleep = true;
      daysMissed = 1;
      tasksByType.dailys[0].completed = true;
      tasksByType.dailys[0].startDate = moment(new Date()).add({ days: 1 });

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('clears buffs if user does not have a perfect day (at least one due daily not completed)', () => {
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('clears buffs if user does not have a perfect day (at least one due daily not completed) when user is sleeping', () => {
      user.preferences.sleep = true;
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      user.stats.buffs = {
        str: 1,
        int: 1,
        per: 1,
        con: 1,
        stealth: 0,
        streaks: true,
      };

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.equal(0);
      expect(user.stats.buffs.int).to.equal(0);
      expect(user.stats.buffs.per).to.equal(0);
      expect(user.stats.buffs.con).to.equal(0);
      expect(user.stats.buffs.stealth).to.equal(0);
      expect(user.stats.buffs.streaks).to.be.false;
    });

    it('always grants a perfect day buff when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      const cronOverride = requireAgain(pathToCronLib).cron;
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const previousBuffs = user.stats.buffs.toObject();

      cronOverride({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });

    it('always grants a perfect day buff when CRON_SAFE_MODE is set when user is sleeping', () => {
      user.preferences.sleep = true;
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      const cronOverride = requireAgain(pathToCronLib).cron;
      daysMissed = 1;
      tasksByType.dailys[0].completed = false;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      const previousBuffs = user.stats.buffs.toObject();

      cronOverride({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.stats.buffs.str).to.be.greaterThan(previousBuffs.str);
      expect(user.stats.buffs.int).to.be.greaterThan(previousBuffs.int);
      expect(user.stats.buffs.per).to.be.greaterThan(previousBuffs.per);
      expect(user.stats.buffs.con).to.be.greaterThan(previousBuffs.con);
    });
  });

  describe('adding mp', () => {
    it('should add mp to user', () => {
      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');

      const mpBefore = user.stats.mp;
      tasksByType.dailys[0].completed = true;
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { maxMP: 100 }));
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.stats.mp).to.be.greaterThan(mpBefore);

      common.statsComputed.restore();
    });

    it('should not add mp to user when user is sleeping', () => {
      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');

      user.preferences.sleep = true;
      const mpBefore = user.stats.mp;
      tasksByType.dailys[0].completed = true;
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { maxMP: 100 }));
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.stats.mp).to.equal(mpBefore);

      common.statsComputed.restore();
    });

    it('set user\'s mp to statsComputed.maxMP when user.stats.mp is greater', () => {
      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      user.stats.mp = 120;
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { maxMP: 100 }));
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.stats.mp).to.equal(common.statsComputed(user).maxMP);

      common.statsComputed.restore();
    });
  });

  describe('quest progress', () => {
    beforeEach(() => {
      const daily = {
        text: 'test daily',
        type: 'daily',
      };

      const task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line new-cap
      tasksByType.dailys = [];
      tasksByType.dailys.push(task);

      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { con: 1 }));

      daysMissed = 1;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });
    });

    afterEach(() => {
      common.statsComputed.restore();
    });

    it('resets user progress', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.party.quest.progress.up).to.equal(0);
      expect(user.party.quest.progress.down).to.equal(0);
      expect(user.party.quest.progress.collectedItems).to.equal(0);
    });

    it('applies the user progress', () => {
      const progress = cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(progress.down).to.equal(-1);
    });
  });

  describe('notifications', () => {
    it('adds a user notification', () => {
      const mpBefore = user.stats.mp;
      tasksByType.dailys[0].completed = true;

      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { maxMP: 100 }));

      daysMissed = 1;
      const hpBefore = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.notifications.length).to.be.greaterThan(0);
      expect(user.notifications[1].type).to.equal('CRON');
      expect(user.notifications[1].data).to.eql({
        hp: user.stats.hp - hpBefore,
        mp: user.stats.mp - mpBefore,
      });

      common.statsComputed.restore();
    });

    it('condenses multiple notifications into one', () => {
      const mpBefore1 = user.stats.mp;
      tasksByType.dailys[0].completed = true;

      const statsComputedRes = common.statsComputed(user);
      const stubbedStatsComputed = sinon.stub(common, 'statsComputed');
      stubbedStatsComputed.returns(Object.assign(statsComputedRes, { maxMP: 100 }));

      daysMissed = 1;
      const hpBefore1 = user.stats.hp;
      tasksByType.dailys[0].startDate = moment(new Date()).subtract({ days: 1 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.notifications.length).to.be.greaterThan(0);
      expect(user.notifications[1].type).to.equal('CRON');
      expect(user.notifications[1].data).to.eql({
        hp: user.stats.hp - hpBefore1,
        mp: user.stats.mp - mpBefore1,
      });

      const notifsBefore2 = user.notifications.length;
      const hpBefore2 = user.stats.hp;
      const mpBefore2 = user.stats.mp;

      user.lastCron = moment(new Date()).subtract({ days: 2 });

      cron({
        user, tasksByType, daysMissed, analytics,
      });

      expect(user.notifications.length - notifsBefore2).to.equal(0);
      expect(user.notifications[0].type).to.not.equal('CRON');
      expect(user.notifications[1].type).to.equal('CRON');
      expect(user.notifications[1].data).to.eql({
        hp: user.stats.hp - hpBefore2 - (hpBefore2 - hpBefore1),
        mp: user.stats.mp - mpBefore2 - (mpBefore2 - mpBefore1),
      });
      expect(user.notifications[0].type).to.not.equal('CRON');
      common.statsComputed.restore();
    });
  });

  describe('private messages', () => {
    let lastMessageId;

    beforeEach(() => {
      const maxPMs = 200;
      for (let index = 0; index < maxPMs - 1; index += 1) {
        const messageId = common.uuid();
        user.inbox.messages[messageId] = {
          id: messageId,
          text: `test ${index}`,
          timestamp: Number(new Date()),
          likes: {},
          flags: {},
          flagCount: 0,
        };
      }

      lastMessageId = common.uuid();
      user.inbox.messages[lastMessageId] = {
        id: lastMessageId,
        text: `test ${lastMessageId}`,
        timestamp: Number(new Date()),
        likes: {},
        flags: {},
        flagCount: 0,
      };
    });
  });

  describe('login incentives', () => {
    it('increments incentive counter each cron', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(1);
      user.lastCron = moment(new Date()).subtract({ days: 1 });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(2);
    });

    it('pushes a notification of the day\'s incentive each cron', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.notifications.length).to.be.greaterThan(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('replaces previous notifications', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      cron({
        user, tasksByType, daysMissed, analytics,
      });

      const filteredNotifications = user.notifications.filter(n => n.type === 'LOGIN_INCENTIVE');

      expect(filteredNotifications.length).to.equal(1);
    });

    it('increments loginIncentives by 1 even if days are skipped in between', () => {
      daysMissed = 3;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(1);
    });

    it('increments loginIncentives by 1 even if user is sleeping', () => {
      user.preferences.sleep = true;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(1);
    });

    it('awards user bard robes if login incentive is 1', () => {
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(1);
      expect(user.items.gear.owned.armor_special_bardRobes).to.eql(true);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user incentive backgrounds if login incentive is 2', () => {
      user.loginIncentives = 1;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(2);
      expect(user.purchased.background.blue).to.eql(true);
      expect(user.purchased.background.green).to.eql(true);
      expect(user.purchased.background.purple).to.eql(true);
      expect(user.purchased.background.red).to.eql(true);
      expect(user.purchased.background.yellow).to.eql(true);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user Bard Hat if login incentive is 3', () => {
      user.loginIncentives = 2;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(3);
      expect(user.items.gear.owned.head_special_bardHat).to.eql(true);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user RoyalPurple Hatching Potion if login incentive is 4', () => {
      user.loginIncentives = 3;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(4);
      expect(user.items.hatchingPotions.RoyalPurple).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a Chocolate, Meat and Pink Contton Candy if login incentive is 5', () => {
      user.loginIncentives = 4;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(5);

      expect(user.items.food.Chocolate).to.eql(1);
      expect(user.items.food.Meat).to.eql(1);
      expect(user.items.food.CottonCandyPink).to.eql(1);

      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user moon quest if login incentive is 7', () => {
      user.loginIncentives = 6;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(7);
      expect(user.items.quests.moon1).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user RoyalPurple Hatching Potion if login incentive is 10', () => {
      user.loginIncentives = 9;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(10);
      expect(user.items.hatchingPotions.RoyalPurple).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a Strawberry, Patato and Blue Contton Candy if login incentive is 14', () => {
      user.loginIncentives = 13;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(14);

      expect(user.items.food.Strawberry).to.eql(1);
      expect(user.items.food.Potatoe).to.eql(1);
      expect(user.items.food.CottonCandyBlue).to.eql(1);

      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a bard instrument if login incentive is 18', () => {
      user.loginIncentives = 17;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(18);
      expect(user.items.gear.owned.weapon_special_bardInstrument).to.eql(true);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user second moon quest if login incentive is 22', () => {
      user.loginIncentives = 21;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(22);
      expect(user.items.quests.moon2).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a RoyalPurple hatching potion if login incentive is 26', () => {
      user.loginIncentives = 25;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(26);
      expect(user.items.hatchingPotions.RoyalPurple).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user Fish, Milk, Rotten Meat and Honey if login incentive is 30', () => {
      user.loginIncentives = 29;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(30);

      expect(user.items.food.Fish).to.eql(1);
      expect(user.items.food.Milk).to.eql(1);
      expect(user.items.food.RottenMeat).to.eql(1);
      expect(user.items.food.Honey).to.eql(1);

      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a RoyalPurple hatching potion if login incentive is 35', () => {
      user.loginIncentives = 34;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(35);
      expect(user.items.hatchingPotions.RoyalPurple).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user the third moon quest if login incentive is 40', () => {
      user.loginIncentives = 39;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(40);
      expect(user.items.quests.moon3).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a RoyalPurple hatching potion if login incentive is 45', () => {
      user.loginIncentives = 44;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(45);
      expect(user.items.hatchingPotions.RoyalPurple).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });

    it('awards user a saddle if login incentive is 50', () => {
      user.loginIncentives = 49;
      cron({
        user, tasksByType, daysMissed, analytics,
      });
      expect(user.loginIncentives).to.eql(50);
      expect(user.items.food.Saddle).to.eql(1);
      expect(user.notifications[0].type).to.eql('LOGIN_INCENTIVE');
    });
  });
});

describe('recoverCron', () => {
  let locals; let status; let
    execStub;

  beforeEach(() => {
    execStub = sandbox.stub();
    sandbox.stub(User, 'findOne').returns({ exec: execStub });

    status = { times: 0 };
    locals = {
      user: new User({
        auth: {
          local: {
            username: 'username',
            lowerCaseUsername: 'username',
            email: 'email@example.com',
            salt: 'salt',
            hashed_password: 'hashed_password', // eslint-disable-line camelcase
          },
        },
      }),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('throws an error if user cannot be found', async () => {
    execStub.returns(Promise.resolve(null));

    try {
      await recoverCron(status, locals);
      throw new Error('no exception when user cannot be found');
    } catch (err) {
      expect(err.message).to.eql(`User ${locals.user._id} not found while recovering.`);
    }
  });

  it('increases status.times count and reruns up to 4 times', async () => {
    execStub.returns(Promise.resolve({ _cronSignature: 'RUNNING_CRON' }));
    execStub.onCall(4).returns(Promise.resolve({ _cronSignature: 'NOT_RUNNING' }));

    await recoverCron(status, locals);

    expect(status.times).to.eql(4);
    expect(locals.user).to.eql({ _cronSignature: 'NOT_RUNNING' });
  });

  it('throws an error if recoverCron runs 5 times', async () => {
    execStub.returns(Promise.resolve({ _cronSignature: 'RUNNING_CRON' }));

    try {
      await recoverCron(status, locals);
      throw new Error('no exception when recoverCron runs 5 times');
    } catch (err) {
      expect(status.times).to.eql(5);
      expect(err.message).to.eql(`Impossible to recover from cron for user ${locals.user._id}.`);
    }
  });
});
