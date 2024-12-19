import find from 'lodash/find';
import maxBy from 'lodash/maxBy';
import {
  ARMOIRE_RELEASE_DATES,
  EGGS_RELEASE_DATES,
  HATCHING_POTIONS_RELEASE_DATES,
} from '../../website/common/script/content/constants/releaseDates';
import armoire from '../../website/common/script/content/gear/sets/armoire';
import eggs from '../../website/common/script/content/eggs';
import hatchingPotions from '../../website/common/script/content/hatching-potions';

describe('releaseDates', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });
  describe('armoire', () => {
    it('should only contain valid armoire names', () => {
      const lastReleaseDate = maxBy(Object.values(ARMOIRE_RELEASE_DATES), value => new Date(`${value.year}-${value.month}-22`));
      clock = sinon.useFakeTimers(new Date(`${lastReleaseDate.year}-${lastReleaseDate.month}-22`));
      Object.keys(ARMOIRE_RELEASE_DATES).forEach(key => {
        expect(find(armoire.all, { set: key }), `${key} is not a valid armoire set`).to.exist;
      });
    });

    it('should contain a valid year and month', () => {
      Object.keys(ARMOIRE_RELEASE_DATES).forEach(key => {
        const date = ARMOIRE_RELEASE_DATES[key];
        expect(date.year, `${key} year is not a valid year`).to.be.a('number');
        expect(date.year).to.be.at.least(2023);
        expect(date.month, `${key} month is not a valid month`).to.be.a('number');
        expect(date.month).to.be.within(1, 12);
        expect(date.day).to.not.exist;
      });
    });
  });

  describe('eggs', () => {
    it('should only contain valid egg names', () => {
      const lastReleaseDate = maxBy(Object.values(EGGS_RELEASE_DATES), value => new Date(`${value.year}-${value.month}-${value.day}`));
      clock = sinon.useFakeTimers(new Date(`${lastReleaseDate.year}-${lastReleaseDate.month}-${lastReleaseDate.day + 1}`));
      Object.keys(EGGS_RELEASE_DATES).forEach(key => {
        expect(eggs.all[key], `${key} is not a valid egg name`).to.exist;
      });
    });

    it('should contain a valid year, month and date', () => {
      Object.keys(EGGS_RELEASE_DATES).forEach(key => {
        const date = EGGS_RELEASE_DATES[key];
        expect(date.year, `${key} year is not a valid year`).to.be.a('number');
        expect(date.year).to.be.at.least(2024);
        expect(date.month, `${key} month is not a valid month`).to.be.a('number');
        expect(date.month).to.be.within(1, 12);
        expect(date.day, `${key} day is not a valid day`).to.be.a('number');
      });
    });
  });

  describe('hatchingPotions', () => {
    it('should only contain valid potion names', () => {
      const lastReleaseDate = maxBy(Object.values(HATCHING_POTIONS_RELEASE_DATES), value => new Date(`${value.year}-${value.month}-${value.day}`));
      clock = sinon.useFakeTimers(new Date(`${lastReleaseDate.year}-${lastReleaseDate.month}-${lastReleaseDate.day + 1}`));
      Object.keys(HATCHING_POTIONS_RELEASE_DATES).forEach(key => {
        expect(hatchingPotions.all[key], `${key} is not a valid potion name`).to.exist;
      });
    });

    it('should contain a valid year, month and date', () => {
      Object.keys(HATCHING_POTIONS_RELEASE_DATES).forEach(key => {
        const date = HATCHING_POTIONS_RELEASE_DATES[key];
        expect(date.year, `${key} year is not a valid year`).to.be.a('number');
        expect(date.year).to.be.at.least(2024);
        expect(date.month, `${key} month is not a valid month`).to.be.a('number');
        expect(date.month).to.be.within(1, 12);
        expect(date.day, `${key} day is not a valid day`).to.be.a('number');
      });
    });
  });
});
