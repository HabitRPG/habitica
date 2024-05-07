/* import { each } from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper'; */
// eslint-disable-next-line max-len
import moment from 'moment';
import { getAllScheduleMatchingGroups, clearCachedMatchers } from '../../website/common/script/content/constants/schedule';

function validateMatcher (matcher, checkedDate) {
  expect(matcher.end).to.be.a('date');
  expect(matcher.end).to.be.greaterThan(checkedDate);
}

describe('Content Schedule', () => {
  beforeEach(() => {
    clearCachedMatchers();
  });

  it('assembles scheduled items on january 15th', () => {
    const date = new Date('2024-01-15');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('assembles scheduled items on january 31th', () => {
    const date = new Date('2024-01-31');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('assembles scheduled items on march 2nd', () => {
    const date = new Date('2024-03-02');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('assembles scheduled items on march 21st', () => {
    const date = new Date('2024-03-21');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('assembles scheduled items on october 7th', () => {
    const date = new Date('2024-10-07');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });
  it('assembles scheduled items on november 1th', () => {
    const date = new Date('2024-11-01');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('assembles scheduled items on december 20th', () => {
    const date = new Date('2024-12-20');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
  });

  it('sets the end date if its in the same month', () => {
    const date = new Date('2024-04-03');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
    expect(matchers.backgrounds.end).to.eql(moment('2024-04-07').toDate());
  });

  it('sets the end date if its in the next day', () => {
    const date = new Date('2024-05-06T14:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
    expect(matchers.backgrounds.end).to.eql(moment('2024-05-07').toDate());
  });

  it('sets the end date if its on the release day', () => {
    const date = new Date('2024-05-07');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
    expect(matchers.backgrounds.end).to.eql(moment('2024-06-07').toDate());
  });

  it('sets the end date if its next month', () => {
    const date = new Date('2024-05-20T01:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
    expect(matchers.backgrounds.end).to.eql(moment('2024-06-07').toDate());
  });

  it('sets the end date for a gala', () => {
    const date = new Date('2024-05-20');
    const matchers = getAllScheduleMatchingGroups(date);
    for (const key in matchers) {
      if (matchers[key]) {
        validateMatcher(matchers[key], date);
      }
    }
    expect(matchers.seasonalGear.end).to.eql(moment('2024-06-21').toDate());
  });

  describe('backgrounds matcher', () => {
    it('allows background matching the month for new backgrounds', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey072024')).to.be.true;
    });

    it('disallows background in the future', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey072025')).to.be.false;
    });

    it('disallows background for the inverse month for new backgrounds', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey012024')).to.be.false;
    });

    it('allows background for the inverse month for old backgrounds', () => {
      const date = new Date('2024-08-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey022023')).to.be.true;
      expect(matcher.match('backgroundkey022021')).to.be.true;
    });

    it('allows background even yeared backgrounds in first half of year', () => {
      const date = new Date('2025-02-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey022024')).to.be.true;
      expect(matcher.match('backgroundkey082022')).to.be.true;
    });

    it('allows background odd yeared backgrounds in second half of year', () => {
      const date = new Date('2024-08-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey022023')).to.be.true;
      expect(matcher.match('backgroundkey082021')).to.be.true;
    });
  });

  describe('timeTravelers matcher', () => {
    it('allows sets matching the month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202307')).to.be.true;
      expect(matcher.match('202207')).to.be.true;
    });

    it('disallows sets not matching the month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202306')).to.be.false;
      expect(matcher.match('202402')).to.be.false;
    });

    it('disallows sets from current month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202407')).to.be.false;
    });

    it('disallows sets from the future', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('202507')).to.be.false;
    });
  });
});
