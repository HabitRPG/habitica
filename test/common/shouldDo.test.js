import { shouldDo } from '../../common/script/cron';
import moment from 'moment';

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

    it('activates Daily on matching days of the week', () => {
      expect(shouldDo(day, dailyTask, options)).to.equal(true);
    });
  });
});
