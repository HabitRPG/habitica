import { shouldDo } from '../../website/common/script/cron';
import moment from 'moment';

describe.only('shouldDo', () => {
  let day, dailyTask;
  let options = {};

  beforeEach(() => {
    day = new Date();
    dailyTask = {
      completed: 'false',
      everyX: 1,
      frequency: 'weekly',
      type: 'daily',
      repeat: {
        su: true,
        s: true,
        f: true,
        th: true,
        w: true,
        t: true,
        m: true,
      },
      startDate: new Date(),
    };
  });

  it('leaves Daily inactive before start date', () => {
    dailyTask.startDate = moment().add(1, 'days').toDate();

    expect(shouldDo(day, dailyTask, options)).to.equal(false);
  });

  context('Every X Days', () => {
    it('leaves Daily inactive in between X Day intervals', () => {
      dailyTask.startDate = moment().subtract(1, 'days').toDate();
      dailyTask.frequency = 'daily';
      dailyTask.everyX = 2;

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on multiples of X Days', () => {
      dailyTask.startDate = moment().subtract(7, 'days').toDate();
      dailyTask.frequency = 'daily';
      dailyTask.everyX = 7;

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  context('Certain Days of the Week', () => {
    it('leaves Daily inactive if day of the week does not match', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      for (let weekday of [0, 1, 2, 3, 4, 5, 6]) {
        day = moment().day(weekday).toDate();

        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      }
    });

    it('leaves Daily inactive if day of the week does not match and active on the day it matches', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: true,
        w: false,
        t: false,
        m: false,
      };

      for (let weekday of [0, 1, 2, 3, 4, 5, 6]) {
        day = moment().add(1, 'weeks').day(weekday).toDate();

        if (weekday === 4) {
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        } else {
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        }
      }
    });

    it('activates Daily on matching days of the week', () => {
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  context('Every X Weeks', () => {
    it('leaves daily inactive if it has not been the specified number of weeks', () => {
      dailyTask.everyX = 3;
      let tomorrow = moment().add(1, 'day').toDate();

      expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
    });

    xit('leaves daily inactive it is not the correct day of the week', () => {
      dailyTask.everyX = 3;
      let threeWeeksFromTodayPlusOne = moment().add(1, 'day').add(3, 'weeks').toDate();

      expect(shouldDo(threeWeeksFromTodayPlusOne, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on matching week', () => {
      dailyTask.everyX = 3;
      let threeWeeksFromToday = moment().add(3, 'weeks').toDate();

      expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
    });

    xit('activates Daily on matching week and matching day', () => {
      dailyTask.everyX = 3;
      let threeWeeksFromToday = moment().add(3, 'weeks').toDate();

      expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
    });
  });

  context('Monthly - Every Day of the month', () => {
    it('leaves daily inactive if not day of the month', () => {
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      dailyTask.daysOfMonth = [15];
      let tomorrow = moment().add(1, 'day').toDate();// @TODO: make sure this is not the 15

      expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on matching day of month', () => {
      day = moment();
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      dailyTask.daysOfMonth = [day.date()];
      day = day.add(1, 'months').date(day.date()).toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  context('Monthly - Every Day of the week', () => {
    it('leaves daily inactive if not the correct week of the month on the day of the start date', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: true,
        w: false,
        t: false,
        m: false,
      };
      day = moment();
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      dailyTask.weeksOfMonth = [day.week()];
      day = day.add(1, 'day').toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on matching day of month', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: true,
        w: false,
        t: false,
        m: false,
      };

      day = moment();
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      dailyTask.weeksOfMonth = [day.week()];
      day = day.add(1, 'months').weekday(4).toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  // context('Every X Months');
  // context('Every X Years');
});
