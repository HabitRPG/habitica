import moment from 'moment';

import { startOfDay, daysSince } from '../../../website/common/script/cron';

function localMoment (timeString, utcOffset) {
  return moment(timeString).utcOffset(utcOffset, true);
}

describe('cron utility functions', () => {
  describe('startOfDay', () => {
    it('is zero when no daystart configured', () => {
      const options = { now: moment('2020-02-02 09:30:00Z'), timezoneOffset: 0 };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 00:00:00Z');
    });

    it('is zero when negative daystart configured', () => {
      const options = {
        now: moment('2020-02-02 09:30:00Z'),
        timezoneOffset: 0,
        daystart: -5,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 00:00:00Z');
    });

    it('is zero when daystart over 24 is configured', () => {
      const options = {
        now: moment('2020-02-02 09:30:00Z'),
        timezoneOffset: 0,
        daystart: 25,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 00:00:00Z');
    });

    it('is equal to daystart o\'clock when daystart configured', () => {
      const options = {
        now: moment('2020-02-02 09:30:00Z'),
        timezoneOffset: 0,
        dayStart: 5,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 05:00:00Z');
    });

    it('is previous day daystart o\'clock when daystart is after current time', () => {
      const options = {
        now: moment('2020-02-02 04:30:00Z'),
        timezoneOffset: 0,
        dayStart: 5,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-01 05:00:00Z');
    });

    it('is daystart o\'clock when daystart is after current time due to timezone', () => {
      const options = {
        now: moment('2020-02-02 04:30:00Z'),
        timezoneOffset: -120,
        dayStart: 5,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 05:00:00+02:00');
    });

    it('returns in default timezone if no timezone defined', () => {
      const utcOffset = moment().utcOffset();
      const now = localMoment('2020-02-02 04:30:00', utcOffset).utc();

      const result = startOfDay({ now });

      expect(result).to.be.sameMoment(localMoment('2020-02-02', utcOffset));
    });

    it('returns in default timezone if timezone lower than -12:00', () => {
      const utcOffset = moment().utcOffset();
      const options = {
        now: localMoment('2020-02-02 17:30:00', utcOffset).utc(),
        timezoneOffset: 721,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment(localMoment('2020-02-02', utcOffset));
    });

    it('returns in default timezone if timezone higher than +14:00', () => {
      const utcOffset = moment().utcOffset();
      const options = {
        now: localMoment('2020-02-02 07:32:25.376', utcOffset).utc(),
        timezoneOffset: -841,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment(localMoment('2020-02-02', utcOffset));
    });

    it('returns in overridden timezone if override present', () => {
      const options = {
        now: moment('2020-02-02 13:30:27Z'),
        timezoneOffset: 0,
        timezoneUtcOffsetOverride: -240,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment('2020-02-02 00:00:00-04:00');
    });

    it('returns start of yesterday if timezone difference carries it over datelines', () => {
      const offset = 300;
      const options = {
        now: moment('2020-02-02 04:30:00Z'),
        timezoneOffset: offset,
      };

      const result = startOfDay(options);

      expect(result).to.be.sameMoment(localMoment('2020-02-01', -offset));
    });
  });

  describe('daysSince', () => {
    it('correctly calculates days between two dates', () => {
      const now = moment();
      const dayBeforeYesterday = moment(now).subtract({ days: 2 });

      expect(daysSince(dayBeforeYesterday, { now })).to.equal(2);
    });

    it('is one lower if current time is before dayStart', () => {
      const oneWeekAgoAtOnePm = moment().hour(13).subtract({ days: 7 });
      const thisMorningThreeAm = moment().hour(3);
      const options = {
        now: thisMorningThreeAm,
        dayStart: 6,
      };

      const result = daysSince(oneWeekAgoAtOnePm, options);

      expect(result).to.equal(6);
    });

    it('is one higher if reference time is before dayStart and current time after dayStart', () => {
      const oneWeekAgoAtEightAm = moment().hour(8).subtract({ days: 7 });
      const todayAtFivePm = moment().hour(17);
      const options = {
        now: todayAtFivePm,
        dayStart: 11,
      };

      const result = daysSince(oneWeekAgoAtEightAm, options);

      expect(result).to.equal(8);
    });

    // Variations in timezone configuration options are already covered by startOfDay tests.
    it('uses now in user timezone as configured in options', () => {
      const timezoneOffset = 120;
      const options = {
        now: moment('1989-11-09 02:53:00+01:00'),
        timezoneOffset,
      };

      const result = daysSince(localMoment('1989-11-08', -timezoneOffset), options);

      expect(result).to.equal(0);
    });
  });
});
