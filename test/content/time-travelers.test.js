import {
  generateUser,
} from '../helpers/common.helper';

import timeTravelers from '../../website/common/script/content/time-travelers';

describe('time-travelers store', () => {
  let user;
  let date;
  beforeEach(() => {
    user = generateUser();
  });

  describe('on january 15th', () => {
    beforeEach(() => {
      date = new Date('2024-01-15');
    });
    it('returns the correct gear', () => {
      const items = timeTravelers.timeTravelerStore(user, date);
      for (const [key] of Object.entries(items)) {
        if (key.startsWith('20')) {
          expect(key).to.match(/20[0-9]{2}(01|07)/);
        }
      }
    });
    it('removes owned sets from the time travelers store', () => {
      user.items.gear.owned.head_mystery_201601 = true; // eslint-disable-line camelcase
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201601']).to.not.exist;
      expect(items['201801']).to.exist;
      expect(items['202207']).to.exist;
    });

    it('removes unopened mystery item sets from the time travelers store', () => {
      user.purchased = {
        plan: {
          mysteryItems: ['head_mystery_201601'],
        },
      };
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201601']).to.not.exist;
      expect(items['201607']).to.exist;
    });
  });

  describe('on may 1st', () => {
    beforeEach(() => {
      date = new Date('2024-05-01T09:00:00.000Z');
    });
    it('returns the correct gear', () => {
      const items = timeTravelers.timeTravelerStore(user, date);
      for (const [key] of Object.entries(items)) {
        if (key.startsWith('20')) {
          expect(key).to.match(/20[0-9]{2}(05|11)/);
        }
      }
    });
    it('removes owned sets from the time travelers store', () => {
      user.items.gear.owned.head_mystery_201705 = true; // eslint-disable-line camelcase
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201705']).to.not.exist;
      expect(items['201805']).to.exist;
      expect(items['202211']).to.exist;
    });

    it('removes unopened mystery item sets from the time travelers store', () => {
      user.purchased = {
        plan: {
          mysteryItems: ['head_mystery_201705'],
        },
      };
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201705']).to.not.exist;
      expect(items['201611']).to.exist;
    });
  });

  describe('on october 21st', () => {
    beforeEach(() => {
      date = new Date('2024-10-21');
    });
    it('returns the correct gear', () => {
      const items = timeTravelers.timeTravelerStore(user, date);
      for (const [key] of Object.entries(items)) {
        if (key.startsWith('20')) {
          expect(key).to.match(/20[0-9]{2}(10|04)/);
        }
      }
    });
    it('removes owned sets from the time travelers store', () => {
      user.items.gear.owned.head_mystery_201810 = true; // eslint-disable-line camelcase
      user.items.gear.owned.armor_mystery_201810 = true; // eslint-disable-line camelcase
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201810']).to.not.exist;
      expect(items['201910']).to.exist;
      expect(items['202204']).to.exist;
    });

    it('removes unopened mystery item sets from the time travelers store', () => {
      user.purchased = {
        plan: {
          mysteryItems: ['armor_mystery_201710'],
        },
      };
      const items = timeTravelers.timeTravelerStore(user, date);
      expect(items['201710']).to.not.exist;
      expect(items['201604']).to.exist;
    });
  });
});
