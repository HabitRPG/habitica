import * as Tasks from '../../../../../../website/server/models/task';
import { cron } from '../../../../../../website/server/libs/cron';
import analytics from '../../../../../../website/server/libs/analyticsService';
import { model as User } from '../../../../../../website/server/models/user';

describe('habits', () => {
  let user;
  let tasksByType = {habits: [], dailys: [], todos: [], rewards: []};
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

    user._statsComputed = {
      mp: 10,
    };

    let habit = {
      text: 'test habit',
      type: 'habit',
    };

    let task = new Tasks.habit(Tasks.Task.sanitize(habit)); // eslint-disable-line new-cap
    tasksByType.habits = [];
    tasksByType.habits.push(task);
  });

  it('should decrement only up value', () => {
    tasksByType.habits[0].value = 1;
    tasksByType.habits[0].down = false;

    cron({user, tasksByType, daysMissed, analytics});

    expect(tasksByType.habits[0].value).to.be.lessThan(1);
  });

  it('should decrement only down value', () => {
    tasksByType.habits[0].value = 1;
    tasksByType.habits[0].up = false;

    cron({user, tasksByType, daysMissed, analytics});

    expect(tasksByType.habits[0].value).to.be.lessThan(1);
  });

  it('should do nothing to habits with both up and down', () => {
    tasksByType.habits[0].value = 1;
    tasksByType.habits[0].up = true;
    tasksByType.habits[0].down = true;

    cron({user, tasksByType, daysMissed, analytics});

    expect(tasksByType.habits[0].value).to.equal(1);
  });

  it('should decrement when user is asleep', () => {
    user.preferences.sleep = true;
    tasksByType.habits[0].value = 1;
    tasksByType.habits[0].up = false;

    cron({user, tasksByType, daysMissed, analytics});

    expect(tasksByType.habits[0].value).to.be.lessThan(1);
  });

  describe('counters', () => {
    let notStartOfWeekOrMonth = new Date(2016, 9, 28).getTime(); // a Friday
    let clock;

    beforeEach(() => {
      // Replace system clocks so we can get predictable results
      clock = sinon.useFakeTimers(notStartOfWeekOrMonth);
    });
    afterEach(() => {
      return clock.restore();
    });

    it('should reset a daily habit counter each day', () => {
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should reset habit counters even if user is resting in the Inn', () => {
      user.preferences.sleep = true;
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;

      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should reset a weekly habit counter each Monday', () => {
      tasksByType.habits[0].frequency = 'weekly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;

      // should not reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);

      // should reset
      daysMissed = 8;
      cron({user, tasksByType, daysMissed, analytics});

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
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);

      clock.restore();

      // Server clock: Monday 3am UTC
      monday = new Date('May 22, 2017 03:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(monday);

      // should reset after user CDS
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should not reset a weekly habit counter when server tz is Monday but user\'s tz is Tuesday', () => {
      clock.restore();

      // Server clock: Monday 11pm UTC
      let monday = new Date('May 22, 2017 23:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(monday);

      // User clock: Tuesday 1am UTC + 2
      user.preferences.timezoneOffset = -120;

      tasksByType.habits[0].frequency = 'weekly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;
      daysMissed = 1;

      // should not reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);

      // User missed one cron, which will subtract User clock back to Monday 1am UTC + 2
      // should reset
      daysMissed = 2;
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should reset a weekly habit counter when server tz is Sunday but user\'s tz is Monday', () => {
      clock.restore();

      // Server clock: Sunday 11pm UTC
      let sunday = new Date('May 21, 2017 23:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(sunday);

      // User clock: Monday 2am UTC + 3
      user.preferences.timezoneOffset = -180;

      tasksByType.habits[0].frequency = 'weekly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;
      daysMissed = 1;

      // should reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should not reset a weekly habit counter when server tz is Monday but user\'s tz is Sunday', () => {
      clock.restore();

      // Server clock: Monday 2am UTC
      let monday = new Date('May 22, 2017 02:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(monday);

      // User clock: Sunday 11pm UTC - 3
      user.preferences.timezoneOffset = 180;

      tasksByType.habits[0].frequency = 'weekly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;
      daysMissed = 1;

      // should not reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);
    });

    it('should reset a monthly habit counter the first day of each month', () => {
      tasksByType.habits[0].frequency = 'monthly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;

      // should not reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);

      // should reset
      daysMissed = 32;
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should reset a monthly habit counter when server tz is last day of month but user tz is first day of the month', () => {
      clock.restore();
      daysMissed = 0;

      // Server clock: 4/30/17 11pm UTC
      let monday = new Date('April 30, 2017 23:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(monday);

      // User clock: 5/1/17 2am UTC + 3
      user.preferences.timezoneOffset = -180;

      tasksByType.habits[0].frequency = 'monthly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;
      daysMissed = 1;

      // should reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });

    it('should not reset a monthly habit counter when server tz is first day of month but user tz is 2nd day of the month', () => {
      clock.restore();

      // Server clock: 5/1/17 11pm UTC
      let monday = new Date('May 1, 2017 23:00:00 GMT').getTime();
      clock = sinon.useFakeTimers(monday);

      // User clock: 5/2/17 2am UTC + 3
      user.preferences.timezoneOffset = -180;

      tasksByType.habits[0].frequency = 'monthly';
      tasksByType.habits[0].counterUp = 1;
      tasksByType.habits[0].counterDown = 1;
      daysMissed = 1;

      // should not reset
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(1);
      expect(tasksByType.habits[0].counterDown).to.equal(1);

      // User missed one day, which will subtract User clock back to 5/1/17 2am UTC + 3
      // should reset
      daysMissed = 2;
      cron({user, tasksByType, daysMissed, analytics});

      expect(tasksByType.habits[0].counterUp).to.equal(0);
      expect(tasksByType.habits[0].counterDown).to.equal(0);
    });
  });
});
