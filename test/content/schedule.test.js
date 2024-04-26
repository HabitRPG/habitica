/* import { each } from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper'; */
// eslint-disable-next-line max-len
import { getAllScheduleMatchingGroups } from '../../website/common/script/content/constants/schedule';

function validateMatcher (matcher, checkedDate) {
  expect(matcher.end).to.be.a('date');
  expect(matcher.end).to.be.greaterThan(checkedDate);
}

describe('Content Schedule', () => {
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
});
