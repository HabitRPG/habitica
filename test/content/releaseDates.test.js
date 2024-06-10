import find from 'lodash/find';
import {
  ARMOIRE_RELEASE_DATES,
  EGGS_RELEASE_DATES,
  HATCHING_POTIONS_RELEASE_DATES,
} from '../../website/common/script/content/constants/releaseDates';
import content from '../../website/common/script/content';

describe('releaseDates', () => {
  describe('armoire', () => {
    it('should only contain valid armoire names', () => {
      Object.keys(ARMOIRE_RELEASE_DATES).forEach(key => {
        expect(find(content.gear.flat, { set: key }), `${key} is not a valid armoire set`).to.exist;
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
      Object.keys(EGGS_RELEASE_DATES).forEach(key => {
        expect(content.eggs[key], `${key} is not a valid egg name`).to.exist;
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
      Object.keys(HATCHING_POTIONS_RELEASE_DATES).forEach(key => {
        expect(content.hatchingPotions[key], `${key} is not a valid potion name`).to.exist;
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
