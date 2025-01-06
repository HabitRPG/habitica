// eslint-disable-next-line max-len
import maxBy from 'lodash/maxBy';
import moment from 'moment';
import nconf from 'nconf';
import {
  getAllScheduleMatchingGroups, clearCachedMatchers, MONTHLY_SCHEDULE, GALA_SCHEDULE,
} from '../../website/common/script/content/constants/schedule';
import QUEST_PETS from '../../website/common/script/content/quests/pets';
import QUEST_HATCHINGPOTIONS from '../../website/common/script/content/quests/potions';
import QUEST_BUNDLES from '../../website/common/script/content/bundles';
import potions from '../../website/common/script/content/hatching-potions';
import SPELLS from '../../website/common/script/content/spells';
import QUEST_SEASONAL from '../../website/common/script/content/quests/seasonal';
import { HATCHING_POTIONS_RELEASE_DATES } from '../../website/common/script/content/constants/releaseDates';

function validateMatcher (matcher, checkedDate) {
  expect(matcher.end).to.be.a('date');
  expect(matcher.end).to.be.greaterThan(checkedDate);
}

describe('Content Schedule', () => {
  let switchoverTime;
  let clock;

  beforeEach(() => {
    switchoverTime = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;
    clearCachedMatchers();
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
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

  it('sets the end date if its on the release day before switchover', () => {
    const date = new Date('2024-05-07T07:00:00.000+00:00');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.backgrounds.end).to.eql(moment.utc(`2024-05-07T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date if its on the release day after switchover', () => {
    const date = new Date('2024-05-07T09:00:00.000+00:00');
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

  it('sets the end date for a winter gala', () => {
    const date = new Date('2024-12-22');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.seasonalGear.end).to.eql(moment.utc(`2025-03-21T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('sets the end date in new year for a winter gala', () => {
    const date = new Date('2025-01-04');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.seasonalGear.end).to.eql(moment.utc(`2025-03-21T${String(switchoverTime).padStart(2, '0')}:00:00.000Z`).toDate());
  });

  it('uses correct date for first hours of the month', () => {
    // if the date is checked before CONTENT_SWITCHOVER_TIME_OFFSET,
    // it should be considered the previous month
    const date = new Date('2024-05-01T02:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.petQuests.items).to.contain('snake');
    expect(matchers.petQuests.items).to.not.contain('horse');
    expect(matchers.timeTravelers.match('202304'), '202304').to.be.true;
    expect(matchers.timeTravelers.match('202404'), '202404').to.be.false;
    expect(matchers.timeTravelers.match('202305'), '202305').to.be.false;
  });

  it('uses correct date after switchover time', () => {
    // if the date is checked after CONTENT_SWITCHOVER_TIME_OFFSET,
    // it should be considered the current
    const date = new Date('2024-05-01T09:00:00.000Z');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.petQuests.items).to.contain('snake');
    expect(matchers.petQuests.items).to.not.contain('horse');
    expect(matchers.timeTravelers.match('202304'), '202304').to.be.false;
    expect(matchers.timeTravelers.match('202305'), '202305').to.be.true;
    expect(matchers.timeTravelers.match('202405'), '202405').to.be.false;
  });

  it('uses UTC timezone', () => {
    // if the date is checked after CONTENT_SWITCHOVER_TIME_OFFSET,
    // it should be considered the current
    clock = sinon.useFakeTimers(new Date('2024-05-01T05:00:00.000-04:00'));
    const matchers = getAllScheduleMatchingGroups();
    expect(matchers.petQuests.items).to.contain('snake');
    expect(matchers.petQuests.items).to.not.contain('horse');
    expect(matchers.timeTravelers.match('202304'), '202304').to.be.false;
    expect(matchers.timeTravelers.match('202305'), '202305').to.be.true;
    expect(matchers.timeTravelers.match('202405'), '202405').to.be.false;
  });

  it('contains content for repeating events', () => {
    const date = new Date('2024-04-15');
    const matchers = getAllScheduleMatchingGroups(date);
    expect(matchers.premiumHatchingPotions).to.exist;
    expect(matchers.premiumHatchingPotions.items.length).to.equal(5);
    expect(matchers.premiumHatchingPotions.items.indexOf('Veggie')).to.not.equal(-1);
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
      const lastReleaseDate = maxBy(Object.values(HATCHING_POTIONS_RELEASE_DATES), value => new Date(`${value.year}-${value.month}-${value.day}`));
      clock = sinon.useFakeTimers(new Date(`${lastReleaseDate.year}-${lastReleaseDate.month}-${lastReleaseDate.day + 1}`));
      const potionKeys = Object.keys(potions.premium);
      Object.keys(MONTHLY_SCHEDULE).forEach(key => {
        const monthlyPotions = MONTHLY_SCHEDULE[key][21].find(item => item.type === 'premiumHatchingPotions');
        for (const potion of monthlyPotions.items) {
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

    it('allows background matching the month for new backgrounds from multiple years', () => {
      const date = new Date('2026-07-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey072024')).to.be.true;
      expect(matcher.match('backgroundkey072025')).to.be.true;
      expect(matcher.match('backgroundkey072026')).to.be.true;
    });

    it('allows background matching the previous month in the first week for new backgrounds', () => {
      const date = new Date('2024-09-02');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey082024')).to.be.true;
      expect(matcher.match('backgroundkey092024')).to.be.false;
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

    it('allows even yeared backgrounds in first half of year', () => {
      const date = new Date('2025-02-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey022024')).to.be.true;
      expect(matcher.match('backgroundkey082022')).to.be.true;
    });

    it('allows odd yeared backgrounds in second half of year', () => {
      const date = new Date('2024-08-08');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey022023')).to.be.true;
      expect(matcher.match('backgroundkey082021')).to.be.true;
    });

    it('allows odd yeared backgrounds in beginning of january', () => {
      const date = new Date('2025-01-06');
      const matcher = getAllScheduleMatchingGroups(date).backgrounds;
      expect(matcher.match('backgroundkey122024'), 'backgroundkey122024').to.be.true;
      expect(matcher.match('backgroundkey062023'), 'backgroundkey062022').to.be.true;
    });
  });

  describe('timeTravelers matcher', () => {
    it('allows sets matching the month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202307'), '202307').to.be.true;
      expect(matcher.match('202207'), '202207').to.be.true;
    });

    it('disallows sets not matching the month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202306'), '202306').to.be.false;
      expect(matcher.match('202402'), '202402').to.be.false;
    });

    it('disallows sets from current month', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202407'), '202407').to.be.false;
    });

    it('disallows sets from the future', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202507'), '202507').to.be.false;
    });

    it('matches sets released in the earlier half of the year', () => {
      const date = new Date('2024-07-08');
      const matcher = getAllScheduleMatchingGroups(date).timeTravelers;
      expect(matcher.match('202401'), '202401').to.be.true;
    });
  });
});
