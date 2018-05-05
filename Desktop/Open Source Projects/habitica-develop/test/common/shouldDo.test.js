import { shouldDo, DAY_MAPPING } from '../../website/common/script/cron';
import moment from 'moment';
import 'moment-recur';

describe('shouldDo', () => {
  let day, dailyTask;
  let options = {};
  let nextDue = [];

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
    options = {};
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

      it('returns false if Start Date is after today',  () => {
        dailyTask.startDate = moment().add(1, 'days').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
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

      it('returns true if Start Date is today', () => {
        dailyTask.startDate = moment().startOf('day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });

      it('returns true if the user\'s current time is after start date and Custom Day Start', () => {
        options.dayStart = 4;
        day = moment().zone(options.timezoneOffset).startOf('day').add(6, 'hours').toDate();
        dailyTask.startDate = moment().zone(options.timezoneOffset).startOf('day').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });

      it('returns false if the user\'s current time is before Custom Day Start', () => {
        options.dayStart = 8;
        day = moment().zone(options.timezoneOffset).startOf('day').add(2, 'hours').toDate();
        dailyTask.startDate = moment().zone(options.timezoneOffset).startOf('day').toDate();
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

      it('returns true if the user\'s current time is after Custom Day Start', () => {
        options.dayStart = 4;
        day = moment().zone(options.timezoneOffset).startOf('day').add(6, 'hours').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });

      it('returns false if the user\'s current time is before Custom Day Start', () => {
        options.dayStart = 8;
        day = moment().zone(options.timezoneOffset).startOf('day').add(2, 'hours').toDate();
        expect(shouldDo(day, dailyTask, options)).to.equal(false);
      });
    });
  });

  context('Custom Day Start variations', () => {
    beforeEach(() => {
      // Daily is due every 2 days, and start today
      dailyTask.frequency = 'daily';
      dailyTask.everyX = 2;
      dailyTask.startDate = new Date();
    });

    context('Custom Day Start is midnight (Default dayStart=0)', () => {
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
          day = moment(day).startOf('day').subtract(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current time is after midnight', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is tomorrow', () => {
        it('should not be due tomorrow', () => {
          day = moment(day).add(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });

    context('Custom Day Start is 0 <= n < 24', () => {
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
        it('returns false if current hour is before Custom Day Start', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current hour is after Custom Day Start', () => {
          day = moment(day).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is tomorrow', () => {
        it('returns true if current hour is before Custom Day Start', () => {
          day = moment(day).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });

        it('returns false if current hour is after Custom Day Start', () => {
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

    it('returns true on multiples of x', () => {
      dailyTask.startDate = moment().subtract(7, 'days').toDate();
      dailyTask.everyX = 7;

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('should compute daily nextDue values', () => {
      options.timezoneOffset = 0;
      options.nextDue = true;

      day = moment('2017-05-01').toDate();
      dailyTask.frequency = 'daily';
      dailyTask.everyX = 2;
      dailyTask.startDate = day;

      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-05-03').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-05-05').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2017-05-07').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2017-05-09').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2017-05-11').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2017-05-13').toDate());
    });

    context('On multiples of x', () => {
      it('returns true when Custom Day Start is midnight', () => {
        dailyTask.startDate = moment().subtract(7, 'days').toDate();
        dailyTask.everyX = 7;

        expect(shouldDo(day, dailyTask, options)).to.equal(true);

        day = moment(day).add(7, 'days');
        expect(shouldDo(day, dailyTask, options)).to.equal(true);

        day = moment(day).add(7, 'days');
        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });

      it('returns true when current time is after Custom Day Start', () => {
        dailyTask.startDate = moment().subtract(5, 'days').toDate();
        dailyTask.everyX = 5;

        options.dayStart = 3;
        day = moment(day).startOf('day').add(8, 'hours').toDate();

        expect(shouldDo(day, dailyTask, options)).to.equal(true);
      });

      it('returns false when current time is before Custom Day Start', () => {
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

    it('returns false and ignore malformed repeat object', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
        errors: 'errors',
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

    it('should compute weekly nextDue values', () => {
      options.timezoneOffset = 0;
      options.nextDue = true;

      day = moment('2017-05-01').toDate();
      dailyTask.frequency = 'weekly';
      dailyTask.everyX = 1;
      dailyTask.repeat = {
        su: true,
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true,
      };
      dailyTask.startDate = day;

      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-05-02').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-05-03').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2017-05-04').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2017-05-05').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2017-05-06').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2017-05-07').toDate());

      dailyTask.everyX = 2;
      dailyTask.repeat = {
        su: true,
        m: false,
        t: false,
        w: false,
        th: false,
        f: true,
        s: false,
      };
      dailyTask.startDate = day;

      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-05-05').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-05-14').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2017-05-19').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2017-05-28').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2017-06-02').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2017-06-11').toDate());
    });

    it('should not go into an infinite loop with invalid values', () => {
      options.nextDue = true;

      day = moment('2017-05-01').toDate();
      dailyTask.frequency = 'weekly';
      dailyTask.everyX = 1;
      dailyTask.startDate = null;

      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue).to.eql(false);

      dailyTask.startDate = day;
      dailyTask.everyX = 0;

      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue).to.eql(false);
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

      context('Custom Day Start is midnight (Default dayStart=0)', () => {
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
            day = moment(day).startOf('day').subtract(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });

          it('returns true if current time is after midnight', () => {
            day = moment(day).startOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(true);
          });
        });

        context('Current Date is one day after the matching day', () => {
          it('should not be due tomorrow', () => {
            day = moment(day).add(1, 'days').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });
        });
      });

      context('Custom Day Start is 0 <= n < 24', () => {
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
          it('returns false if current hour is before Custom Day Start', () => {
            day = moment(day).startOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(false);
          });

          it('returns true if current hour is after Custom Day Start', () => {
            day = moment(day).startOf('day').add(9, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(true);
          });
        });

        context('Current Date is one day after the matching day', () => {
          it('returns true if current hour is before Custom Day Start', () => {
            day = moment(day).endOf('day').add(1, 'hours').toDate();
            expect(shouldDo(day, dailyTask, options)).to.equal(true);
          });

          it('returns false if current hour is after Custom Day Start', () => {
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

  context('Every X Weeks', () => {
    it('leaves daily inactive if it has not been the specified number of weeks', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      day = moment();
      dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
      dailyTask.everyX = 3;
      let tomorrow = day.add(2, 'weeks').day(day.day()).toDate();

      expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
    });

    it('leaves daily inactive if on every (x) week on weekday it is incorrect weekday', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      day = moment();
      dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
      dailyTask.everyX = 3;
      let threeWeeksFromTodayPlusOne = day.add(1, 'day').add(3, 'weeks').toDate();

      expect(shouldDo(threeWeeksFromTodayPlusOne, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on matching week', () => {
      dailyTask.everyX = 3;
      let threeWeeksFromToday = moment().add(3, 'weeks').toDate();

      expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on every (x) week on weekday', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      day = moment();
      dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
      dailyTask.everyX = 3;
      const threeWeeksFromToday = day.add(6, 'weeks').day(day.day()).toDate();

      expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on every (x) week on weekday across a year', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      day = moment('2017-11-19');
      dailyTask.startDate = day.toDate();
      dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
      dailyTask.everyX = 3;
      const threeWeeksFromToday = moment('2018-01-21');

      expect(shouldDo(threeWeeksFromToday, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on start date', () => {
      dailyTask.everyX = 3;

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    context('Custom Day Start is 0 <= n < 24', () => {
      let threeWeeksFromToday;

      beforeEach(() => {
        options.dayStart = 7;
        dailyTask.everyX = 3;
        dailyTask.repeat = {
          su: false,
          s: false,
          f: false,
          th: false,
          w: false,
          t: false,
          m: false,
        };

        day = moment();
        dailyTask.repeat[DAY_MAPPING[day.day()]] = true;
        threeWeeksFromToday = moment().add(3, 'weeks').day(day.day()).toDate();
      });

      context('Current Date is one day before the matching day', () => {
        it('should not be due', () => {
          day = moment(threeWeeksFromToday).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });

      context('Current Date is on the matching day', () => {
        it('returns false if current hour is before Custom Day Start', () => {
          day = moment(threeWeeksFromToday).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current hour is after Custom Day Start', () => {
          day = moment(threeWeeksFromToday).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is one day after the matching day', () => {
        it('returns true if current hour is before Custom Day Start', () => {
          day = moment(threeWeeksFromToday).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });

        it('returns false if current hour is after Custom Day Start', () => {
          day = moment(threeWeeksFromToday).endOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
  });

  context('Monthly - Every X Months on a specified date', () => {
    it('leaves daily inactive if not day of the month', () => {
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      let today = moment();
      dailyTask.daysOfMonth = [today.date()];
      let tomorrow = today.add(1, 'day').toDate();

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

    it('leaves daily inactive if not on date of the x month', () => {
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';
      let today = moment();
      dailyTask.daysOfMonth = [today.date()];
      let tomorrow = today.add(2, 'months').add(1, 'day').toDate();

      expect(shouldDo(tomorrow, dailyTask, options)).to.equal(false);
    });

    it('activates Daily if on date of the x month', () => {
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';
      dailyTask.daysOfMonth = [15];
      day = moment().add(2, 'months').date(15).toDate();
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on start date', () => {
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';
      dailyTask.daysOfMonth = [15];
      day = moment().add(2, 'months').date(15).toDate();
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('should compute monthly nextDue values', () => {
      options.timezoneOffset = 0;
      options.nextDue = true;

      day = moment('2017-05-01').toDate();

      dailyTask.frequency = 'monthly';
      dailyTask.everyX = 3;
      dailyTask.startDate = day;
      dailyTask.daysOfMonth = [1];
      dailyTask.weeksOfMonth = [];
      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-08-01').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-11-01').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2018-02-01').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2018-05-01').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2018-08-01').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2018-11-01').toDate());

      dailyTask.daysOfMonth = [];
      dailyTask.weeksOfMonth = [0];
      dailyTask.everyX = 1;
      dailyTask.repeat = {
        su: false,
        m: true,
        t: false,
        w: false,
        th: false,
        f: false,
        s: false,
      };
      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-06-05').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-07-03').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2017-08-07').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2017-09-04').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2017-10-02').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2017-11-06').toDate());

      day = moment('2017-05-08').toDate();

      dailyTask.daysOfMonth = [];
      dailyTask.weeksOfMonth = [1];
      dailyTask.startDate = day;
      dailyTask.everyX = 1;
      dailyTask.repeat = {
        su: false,
        m: true,
        t: false,
        w: false,
        th: false,
        f: false,
        s: false,
      };
      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-06-12').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-07-10').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2017-08-14').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2017-09-11').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2017-10-09').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2017-11-13').toDate());

      day = moment('2017-05-29').toDate();

      dailyTask.daysOfMonth = [];
      dailyTask.weeksOfMonth = [4];
      dailyTask.startDate = day;
      dailyTask.everyX = 1;
      dailyTask.repeat = {
        su: false,
        m: true,
        t: false,
        w: false,
        th: false,
        f: false,
        s: false,
      };
      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2017-07-31').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2017-10-30').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2018-01-29').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2018-04-30').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2018-07-30').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2018-10-29').toDate());
    });

    context('Custom Day Start is 0 <= n < 24', () => {
      beforeEach(() => {
        options.dayStart = 7;
        dailyTask.everyX = 2;
        dailyTask.frequency = 'monthly';
        dailyTask.daysOfMonth = [15];
        day = moment().add(2, 'months').date(15).toDate();
      });

      context('Current Date is one day before the matching day', () => {
        it('should not be due', () => {
          day = moment(day).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });

      context('Current Date is on the matching day', () => {
        it('returns false if current hour is before Custom Day Start', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current hour is after Custom Day Start', () => {
          day = moment(day).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is one day after the matching day', () => {
        it('returns true if current hour is before Custom Day Start', () => {
          day = moment(day).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });

        it('returns false if current hour is after Custom Day Start', () => {
          day = moment(day).endOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
  });

  context('Monthly - Certain days of the nth Week', () => {
    it('leaves daily inactive if not the correct week of the month on the day of the start date', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-01-27');
      let week = today.monthWeek();
      let dayOfWeek = today.day();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      day = moment('2017-02-23');

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('returns false when next due is requested and no repeats are available', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-05-27T17:34:40.000Z');
      let week = today.monthWeek();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      day = moment('2017-02-23');
      options.nextDue = true;
      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('activates Daily if correct week of the month on the day of the start date', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-01-27');
      let week = today.monthWeek();
      let dayOfWeek = today.day();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
      dailyTask.everyX = 1;
      dailyTask.frequency = 'monthly';
      day = moment('2017-02-24');

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('leaves daily inactive if not day of the month with every x month on weekday', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-01-26:00:00.000-00:00');
      let week = today.monthWeek();
      let dayOfWeek = today.day();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';

      day = moment('2017-03-24:00:00.000-00:00');

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('activates Daily if on nth weekday of the x month', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-01-27:00:00.000-00:00');
      let week = today.monthWeek();
      let dayOfWeek = today.day();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';

      day = moment('2017-03-24:00:00.000-00:00');

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on start date', () => {
      dailyTask.repeat = {
        su: false,
        s: false,
        f: false,
        th: false,
        w: false,
        t: false,
        m: false,
      };

      let today = moment('2017-01-27:00:00.000-00:00');
      let week = today.monthWeek();
      let dayOfWeek = today.day();
      dailyTask.startDate = today.toDate();
      dailyTask.weeksOfMonth = [week];
      dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
      dailyTask.everyX = 2;
      dailyTask.frequency = 'monthly';

      day = moment('2017-03-24:00:00.000-00:00');
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    context('Custom Day Start is 0 <= n < 24', () => {
      beforeEach(() => {
        options.dayStart = 7;
        dailyTask.repeat = {
          su: false,
          s: false,
          f: false,
          th: false,
          w: false,
          t: false,
          m: false,
        };

        let today = moment('2017-01-27');
        let week = today.monthWeek();
        let dayOfWeek = today.day();
        dailyTask.startDate = today.toDate();
        dailyTask.weeksOfMonth = [week];
        dailyTask.repeat[DAY_MAPPING[dayOfWeek]] = true;
        dailyTask.everyX = 2;
        dailyTask.frequency = 'monthly';

        day = moment('2017-03-24');
      });

      context('Current Date is one day before the matching day', () => {
        it('should not be due', () => {
          day = moment(day).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });

      context('Current Date is on the matching day', () => {
        it('returns false if current hour is before Custom Day Start', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current hour is after Custom Day Start', () => {
          day = moment(day).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is one day after the matching day', () => {
        it('returns true if current hour is before Custom Day Start', () => {
          day = moment(day).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });

        it('returns false if current hour is after Custom Day Start', () => {
          day = moment(day).endOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
  });

  context('Every X Years', () => {
    it('leaves daily inactive if not the correct year', () => {
      day = moment();
      dailyTask.everyX = 2;
      dailyTask.frequency = 'yearly';
      day = day.add(1, 'day').toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(false);
    });

    it('activates Daily on matching year', () => {
      day = moment();
      dailyTask.everyX = 2;
      dailyTask.frequency = 'yearly';
      day = day.add(2, 'years').toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('activates Daily on start date', () => {
      day = moment();
      dailyTask.everyX = 2;
      dailyTask.frequency = 'yearly';
      day = day.add(2, 'years').toDate();

      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });

    it('should compute yearly nextDue values', () => {
      options.timezoneOffset = 0;
      options.nextDue = true;

      day = moment('2017-05-01').toDate();

      dailyTask.frequency = 'yearly';
      dailyTask.everyX = 5;
      dailyTask.startDate = day;
      nextDue = shouldDo(day, dailyTask, options);
      expect(nextDue.length).to.eql(6);
      expect(moment(nextDue[0]).toDate()).to.eql(moment.utc('2022-05-01').toDate());
      expect(moment(nextDue[1]).toDate()).to.eql(moment.utc('2027-05-01').toDate());
      expect(moment(nextDue[2]).toDate()).to.eql(moment.utc('2032-05-01').toDate());
      expect(moment(nextDue[3]).toDate()).to.eql(moment.utc('2037-05-01').toDate());
      expect(moment(nextDue[4]).toDate()).to.eql(moment.utc('2042-05-01').toDate());
      expect(moment(nextDue[5]).toDate()).to.eql(moment.utc('2047-05-01').toDate());
    });

    context('Custom Day Start is 0 <= n < 24', () => {
      beforeEach(() => {
        options.dayStart = 7;
        day = moment();
        dailyTask.everyX = 2;
        dailyTask.frequency = 'yearly';
        day = day.add(2, 'years').toDate();
      });

      context('Current Date is one day before the matching day', () => {
        it('should not be due', () => {
          day = moment(day).subtract(1, 'days').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });

      context('Current Date is on the matching day', () => {
        it('returns false if current hour is before Custom Day Start', () => {
          day = moment(day).startOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });

        it('returns true if current hour is after Custom Day Start', () => {
          day = moment(day).startOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });
      });

      context('Current Date is one day after the matching day', () => {
        it('returns true if current hour is before Custom Day Start', () => {
          day = moment(day).endOf('day').add(1, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(true);
        });

        it('returns false if current hour is after Custom Day Start', () => {
          day = moment(day).endOf('day').add(9, 'hours').toDate();
          expect(shouldDo(day, dailyTask, options)).to.equal(false);
        });
      });
    });
  });
});
