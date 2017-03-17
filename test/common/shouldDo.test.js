import { shouldDo } from '../../website/common/script/cron';
import moment from 'moment';
// import 'moment-recur';

describe('shouldDo', () => {
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

  it('returns false if task type is not a daily', () => {
    expect(shouldDo(day, {type: 'todo'})).to.equal(false);
    expect(shouldDo(day, {type: 'habit'})).to.equal(false);
    expect(shouldDo(day, {type: 'reward'})).to.equal(false);
  });

  it('returns false if startDate is in the future', () => {
    dailyTask.startDate = moment().add(1, 'days').toDate();

    expect(shouldDo(day, dailyTask, options)).to.equal(false);
  });

  context('Every X Days', () => {
    beforeEach(() => {
      dailyTask.frequency = 'daily';
    });

    it('returns false if daily does not have an everyX property', () => {
      delete dailyTask.everyX;

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('returns false in between X Day intervals', () => {
      dailyTask.startDate = moment().subtract(1, 'days').toDate();
      dailyTask.everyX = 2;

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('returns true on multiples of x', () => {
      dailyTask.startDate = moment().subtract(7, 'days').toDate();
      dailyTask.everyX = 7;

      expect(shouldDo(day, dailyTask, options)).to.equal(true);

      day = moment(day).add(7, 'days');
      expect(shouldDo(day, dailyTask, options)).to.equal(true);

      day = moment(day).add(7, 'days');
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  context('Certain Days of the Week', () => {
    beforeEach(() => {
      dailyTask.frequency = 'weekly';

      dailyTask.repeat = {
        su: true,
        s: true,
        f: true,
        th: true,
        w: true,
        t: true,
        m: true,
      };
    });

    it('returns false if task does not have a repeat property', () => {
      delete dailyTask.repeat;

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('returns false if day of the week does not match', () => {
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

    it('returns false if day of the week does not match and active on the day it matches', () => {
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

    it('returns true if Daily on matching days of the week', () => {
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });

  // context('Every X Weeks', () => {
  //   it('leaves daily inactive if it has not been the specified number of weeks', () => {
  //     dailyTask.everyX = 3;
  //     let tomorrow = moment().add(1, 'day').toDate();
  //
  //     expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('leaves daily inactive if on every (x) week on weekday it is incorrect weekday', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     day = moment();
  //     dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
  //     dailyTask.everyX = 3;
  //     let threeWeeksFromTodayPlusOne = day.add(1, 'day').add(3, 'weeks').toDate();
  //
  //     expect(shouldDo(threeWeeksFromTodayPlusOne, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily on matching week', () => {
  //     dailyTask.everyX = 3;
  //     let threeWeeksFromToday = moment().add(3, 'weeks').toDate();
  //
  //     expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
  //   });
  //
  //   it('activates Daily on every (x) week on weekday', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     day = moment();
  //     dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
  //     dailyTask.everyX = 3;
  //     let threeWeeksFromToday = day.add(6, 'weeks').day(day.day()).toDate();
  //
  //     expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
  //   });
  // });
  //
  // context('Monthly - Every X Months on a specified date', () => {
  //   it('leaves daily inactive if not day of the month', () => {
  //     dailyTask.everyX = 1;
  //     dailyTask.frequency = 'monthly';
  //     dailyTask.daysOfMonth = [15];
  //     let tomorrow = moment().add(1, 'day').toDate();// @TODO: make sure this is not the 15
  //
  //     expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily on matching day of month', () => {
  //     day = moment();
  //     dailyTask.everyX = 1;
  //     dailyTask.frequency = 'monthly';
  //     dailyTask.daysOfMonth = [day.date()];
  //     day = day.add(1, 'months').date(day.date()).toDate();
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(true);
  //   });
  //
  //   it('leaves daily inactive if not on date of the x month', () => {
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'monthly';
  //     dailyTask.daysOfMonth = [15];
  //     let tomorrow = moment().add(2, 'months').add(1, 'day').toDate();
  //
  //     expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily if on date of the x month', () => {
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'monthly';
  //     dailyTask.daysOfMonth = [15];
  //     day = moment().add(2, 'months').date(15).toDate();
  //     expect(shouldDo(day, dailyTask, options)).to.equal(true);
  //   });
  // });
  //
  // context('Monthly - Certain days of the nth Week', () => {
  //   it('leaves daily inactive if not the correct week of the month on the day of the start date', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     let today = moment('01/27/2017');
  //     let week = today.monthWeek();
  //     let dayOfWeek = today.day();
  //     dailyTask.startDate = today.toDate();
  //     dailyTask.weeksOfMonth = [week];
  //     dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
  //     dailyTask.everyX = 1;
  //     dailyTask.frequency = 'monthly';
  //     day = moment('02/23/2017');
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily if correct week of the month on the day of the start date', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     let today = moment('01/27/2017');
  //     let week = today.monthWeek();
  //     let dayOfWeek = today.day();
  //     dailyTask.startDate = today.toDate();
  //     dailyTask.weeksOfMonth = [week];
  //     dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
  //     dailyTask.everyX = 1;
  //     dailyTask.frequency = 'monthly';
  //     day = moment('02/24/2017');
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(true);
  //   });
  //
  //   it('leaves daily inactive if not day of the month with every x month on weekday', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     let today = moment('01/26/2017');
  //     let week = today.monthWeek();
  //     let dayOfWeek = today.day();
  //     dailyTask.startDate = today.toDate();
  //     dailyTask.weeksOfMonth = [week];
  //     dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'monthly';
  //
  //     day = moment('03/24/2017');
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily if on nth weekday of the x month', () => {
  //     dailyTask.repeat = {
  //       su: false,
  //       s: false,
  //       f: false,
  //       th: false,
  //       w: false,
  //       t: false,
  //       m: false,
  //     };
  //
  //     let today = moment('01/27/2017');
  //     let week = today.monthWeek();
  //     let dayOfWeek = today.day();
  //     dailyTask.startDate = today.toDate();
  //     dailyTask.weeksOfMonth = [week];
  //     dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'monthly';
  //
  //     day = moment('03/24/2017');
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(true);
  //   });
  // });
  //
  // context('Every X Years', () => {
  //   it('leaves daily inactive if not the correct year', () => {
  //     day = moment();
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'yearly';
  //     day = day.add(1, 'day').toDate();
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(false);
  //   });
  //
  //   it('activates Daily on matching year', () => {
  //     day = moment();
  //     dailyTask.everyX = 2;
  //     dailyTask.frequency = 'yearly';
  //     day = day.add(2, 'years').toDate();
  //
  //     expect(shouldDo(day, dailyTask, options)).to.equal(true);
  //   });
  // });
});
