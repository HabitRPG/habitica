import { shouldDo } from '../../website/common/script/cron';
import moment from 'moment';
// import 'moment-recur';

describe('shouldDo', () => {
  let day, dailyTask;
  let options = {};

  beforeEach(() => {
    options = {};
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

  context('Timezone variations', () => {
    beforeEach(() => {
      dailyTask.frequency = 'daily';
    });
    context('User timezone is UTC', () => {
      beforeEach(() => {
        options.timezoneOffset = 0;
      });
      it('returns true if Start Date is before today', () => {
        dailyTask.startDate = moment().subtract(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true if Start Date is today',  () => {
        dailyTask.startDate = moment().toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
    });
    context('User timezone is between UTC-12 and UTC (0~720)', () => {
      beforeEach(() => {
        options.timezoneOffset = 600;
      });
      it('returns true if Start Date is before today', () => {
        dailyTask.startDate = moment().subtract(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true if Start Date is today',  () => {
        dailyTask.startDate = moment().startOf('day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true if the user\'s current time is after start date and CDS', () => {
        options.dayStart = 4;
        day = moment().utcOffset(options.timezoneOffset).startOf('day').add(6, 'hours').toDate();
        dailyTask.startDate = moment().utcOffset(options.timezoneOffset).subtract(1, 'day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns false if the user\'s current time is before CDS', () => {
        options.dayStart = 8;
        day = moment().utcOffset(options.timezoneOffset).startOf('day').add(2, 'hours').toDate();
        dailyTask.startDate = moment().utcOffset(options.timezoneOffset).startOf('day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
    });
    context('User timezone is between UTC and GMT+14 (-840~0)', () => {
      beforeEach(() => {
        options.timezoneOffset = -420;
      });
      it('returns true if Start Date is before today', () => {
        dailyTask.startDate = moment().subtract(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true if Start Date is today',  () => {
        dailyTask.startDate = moment().startOf('day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true if the user\'s current time is after CDS', () => {
        options.dayStart = 4;
        day = moment().utcOffset(options.timezoneOffset).startOf('day').add(6, 'hours').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns false if the user\'s current time is before CDS', () => {
        options.dayStart = 8;
        day = moment().utcOffset(options.timezoneOffset).startOf('day').add(2, 'hours').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
    });
  });

  context('CDS variations', () => {
    beforeEach(() => {
      // Daily is due every 2 days, and start today
      dailyTask.frequency = 'daily';
      dailyTask.everyX = 2;
      dailyTask.startDate = new Date();
    });
    context('CDS is midnight (Default dayStart=0)', () => {
      beforeEach(() => {
        options.dayStart = 0;
      });
      context('Current Date is yesterday', () => {
        it('should not be due yesterday', () => {
          day = moment(day).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
      context('Current Date is today', () => {
        it('returns false if current time is before midnight', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
      context('Current Date is tomorrow', () => {
        it('should not be due tomorrow', () => {
          day = moment(day).add(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
    context('CDS is 0 <= n < 24', () => {
      beforeEach(() => {
        options.dayStart = 7;
      });
      context('Current Date is yesterday', () => {
        it('should not be due yesterday', () => {
          day = moment(day).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
      context('Current Date is today', () => {
        it('returns false if current hour is before CDS', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
        it('returns true if current hour is after CDS', () => {
          day = moment(day).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });
      context('Current Date is tomorrow', () => {
        it('returns true if current hour is before CDS', () => {
          day = moment(day).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
        it('returns false if current hour is after CDS', () => {
          day = moment(day).endOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
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

    it('returns true on the Start Date', () => {
      dailyTask.startDate = moment().toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    context('On multiples of x', () => {
      it('returns true when CDS is midnight', () => {
        dailyTask.startDate = moment().subtract(7, 'days').toDate();
        dailyTask.everyX = 7;

        expect(shouldDo(day, dailyTask, options)).to.equal(true);

        day = moment(day).add(7, 'days');
        expect(shouldDo(day, dailyTask, options)).to.equal(true);

        day = moment(day).add(7, 'days');
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns true when current time is after CDS', () => {
        dailyTask.startDate = moment().subtract(5, 'days').toDate();
        dailyTask.everyX = 5;

        options.dayStart = 3;
        day = moment(day).startOf('day').add(8, 'hours').toDate();

        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });
      it('returns false when current time is before CDS', () => {
        dailyTask.startDate = moment().subtract(5, 'days').toDate();
        dailyTask.everyX = 5;

        options.dayStart = 14;
        day = moment(day).startOf('day').add(7, 'hours').toDate();

        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
    });

    context('If number of X days is zero', () => {
      beforeEach(() => {
        dailyTask.everyX = 0;
      });
      it('returns false on the Start Date', () => {
        dailyTask.startDate = moment().subtract(4, 'days').toDate();
        day = moment().subtract(4, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false on the day before Start Date', () => {
        dailyTask.startDate = moment().subtract(4, 'days').toDate();
        day = moment().subtract(5, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false on the day after Start Date', () => {
        dailyTask.startDate = moment().subtract(4, 'days').toDate();
        day = moment().subtract(3, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false for today', () => {
        dailyTask.startDate = moment().toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
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

    context('Day of the week matches', () => {
      const weekdayMap = {
        1: 'm',
        2: 't',
        3: 'w',
        4: 'th',
        5: 'f',
        6: 's',
        7: 'su',
      };
      beforeEach(() => {
        // Set repeat day to current weekday
        const currentWeekday = moment().isoWeekday();
        dailyTask.startDate = moment().startOf('day').toDate();
        dailyTask.repeat = {
          su: false,
          s: false,
          f: false,
          th: false,
          w: false,
          t: false,
          m: false,
        };
        dailyTask.repeat[weekdayMap[currentWeekday]] = true;
      });
      context('CDS is midnight (Default dayStart=0)', () => {
        beforeEach(() => {
          options.dayStart = 0;
        });
        context('Current Date is one day before the matching day', () => {
          it('should return false', () => {
            day = moment(day).subtract(1, 'days').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
        context('Current Date is on the matching day', () => {
          it('returns false if current time is before midnight', () => {
            day = moment(day).startOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
        context('Current Date is one day after the matching day', () => {
          it('should not be due tomorrow', () => {
            day = moment(day).add(1, 'days').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
      });
      context('CDS is 0 <= n < 24', () => {
        beforeEach(() => {
          options.dayStart = 7;
        });
        context('Current Date is one day before the matching day', () => {
          it('should not be due', () => {
            day = moment(day).subtract(1, 'days').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
        context('Current Date is on the matching day', () => {
          it('returns false if current hour is before CDS', () => {
            day = moment(day).startOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
          it('returns true if current hour is after CDS', () => {
            day = moment(day).startOf('day').add(9, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(true);
          });
        });
        context('Current Date is one day after the matching day', () => {
          it('returns true if current hour is before CDS', () => {
            day = moment(day).endOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(true);
          });
          it('returns false if current hour is after CDS', () => {
            day = moment(day).endOf('day').add(9, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
      });
    });

    context('No days of the week is selected', () => {
      beforeEach(() => {
        dailyTask.repeat = {
          su: false,
          s: false,
          f: false,
          th: false,
          w: false,
          t: false,
          m: false,
        };
      });
      it('returns false for a day before the Start Date', () => {
        day = moment().subtract(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false for the Start Date', () => {
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false for a day after the Start Date', () => {
        day = moment().add(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
      it('returns false for today', () => {
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
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
