// eslint-disable-next-line max-len
import moment from 'moment';
import nconf from 'nconf';
import {
  getAllScheduleMatchingGroups, clearCachedMatchers, MONTHLY_SCHEDULE, GALA_SCHEDULE,
} from '../../website/common/script/content/constants/schedule';
import QUEST_PETS from '../../website/common/script/content/quests/pets';
import QUEST_HATCHINGPOTIONS from '../../website/common/script/content/quests/potions';
import QUEST_BUNDLES from '../../website/common/script/content/bundles';
import { premium } from '../../website/common/script/content/hatching-potions';
import SPELLS from '../../website/common/script/content/spells';
import QUEST_SEASONAL from '../../website/common/script/content/quests/seasonal';

function validateMatcher (matcher, checkedDate) {
  expect(matcher.end).to.be.a('date');
  expect(matcher.end).to.be.greaterThan(checkedDate);
}

describe('Content Schedule', () => {
  let switchoverTime;

  beforeEach(() => {
    switchoverTime = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;
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

  it('assembles scheduled items on march 22st', () => {
    const date = new Date('2024-03-22');
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
    expect(matchers.backgrounds.end).to.eql(moment.utc(`2024-04-07T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date if its in the next day', () => {
    const date = new Date('2024-05-06T14:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.backgrounds.end).to.eql(moment.utc(`2024-05-07T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date if its on the release day', () => {
    const date = new Date('2024-05-07T07:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.backgrounds.end).to.eql(moment.utc(`2024-06-07T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date if its next month', () => {
    const date = new Date('2024-05-20T01:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.backgrounds.end).to.eql(moment.utc(`2024-06-07T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date for a gala', () => {
    const date = new Date('2024-05-20');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.seasonalGear.end).to.eql(moment.utc(`2024-06-21T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('contains content for repeating events', () => {
    const date = new Date('2024-04-15');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.premiumHatchingPotions).to.exist;
    expect(matchers.premiumHatchingPotions.items.length).to.equal(4);
    expect(matchers.premiumHatchingPotions.items.indexOf('Garden')).to.not.equal(-1);
    expect(matchers.premiumHatchingPotions.items.indexOf('Porcelain')).to.not.equal(-1);
  });

  describe('only contains valid keys for', () => {
    it('pet quests', () => {
      const petKeys = Object.keys(QUEST_PETS);
      Object.keys(MONTHLY_SCHEDULE).forEach(key => {
        const petQuests = MONTHLY_SCHEDULE[key][14].find(item => item.type === 'petQuests');
        for (const petQuest of petQuests.items) {
          expect(petQuest).to.be.a('string');
          expect(petKeys).to.include(petQuest);
        }
      });
    });

    it('hatchingpotion quests', () => {
      const potionKeys = Object.keys(QUEST_HATCHINGPOTIONS);
      Object.keys(MONTHLY_SCHEDULE).forEach(key => {
        const potionQuests = MONTHLY_SCHEDULE[key][14].find(item => item.type === 'hatchingPotionQuests');
        for (const potionQuest of potionQuests.items) {
          expect(potionQuest).to.be.a('string');
          expect(potionKeys).to.include(potionQuest);
        }
      });
    });

    it('bundles', () => {
      const bundleKeys = Object.keys(QUEST_BUNDLES);
      Object.keys(MONTHLY_SCHEDULE).forEach(key => {
        const bundles = MONTHLY_SCHEDULE[key][14].find(item => item.type === 'bundles');
        for (const bundle of bundles.items) {
          expect(bundle).to.be.a('string');
          expect(bundleKeys).to.include(bundle);
        }
      });
    });

    it('premium hatching potions', () => {
      const potionKeys = Object.keys(premium);
      Object.keys(MONTHLY_SCHEDULE).forEach(key => {
        const potions = MONTHLY_SCHEDULE[key][21].find(item => item.type === 'premiumHatchingPotions');
        for (const potion of potions.items) {
          expect(potion).to.be.a('string');
          expect(potionKeys).to.include(potion);
        }
      });
    });

    it('seasonal quests', () => {
      const questKeys = Object.keys(QUEST_SEASONAL);
      Object.keys(GALA_SCHEDULE).forEach(key => {
        const quests = GALA_SCHEDULE[key].matchers.find(item => item.type === 'seasonalQuests');
        for (const quest of quests.items) {
          expect(quest).to.be.a('string');
          expect(questKeys).to.include(quest);
        }
      });
    });

    it('seasonal spells', () => {
      const spellKeys = Object.keys(SPELLS.special);
      Object.keys(GALA_SCHEDULE).forEach(key => {
        const petQuests = GALA_SCHEDULE[key].matchers.find(item => item.type === 'seasonalSpells');
        for (const petQuest of petQuests.items) {
          expect(petQuest).to.be.a('string');
          expect(spellKeys).to.include(petQuest);
        }
      });
    });
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
