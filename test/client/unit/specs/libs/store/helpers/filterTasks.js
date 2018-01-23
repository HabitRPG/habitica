import {
  getFilterLabels,
  getActiveFilterFunction,
} from 'client/libs/store/helpers/filterTasks.js';

/* eslint-disable no-exclusive-tests */

describe.only('Filter Category for Tasks', () => {
  describe('getFilterLabels', () => {
    let habit, daily, todo, reward;
    beforeEach(() => {
      habit = ['all', 'yellowred', 'greenblue'];
      daily = ['all', 'due', 'notDue'];
      todo = ['remaining', 'scheduled', 'complete2'];
      reward = ['all', 'custom', 'wishlist'];
    });

    it('should return all habit filter labels', () => {
      getFilterLabels('habit').forEach((item, i) => {
        expect(item).to.eq(habit[i]);
      });
    });

    it('should return all daily filter labels', () => {
      getFilterLabels('daily').forEach((item, i) => {
        expect(item).to.eq(daily[i]);
      });
    });

    it('should return all todo filter labels', () => {
      getFilterLabels('todo').forEach((item, i) => {
        expect(item).to.eq(todo[i]);
      });
    });

    it('should return all reward filter labels', () => {
      getFilterLabels('reward').forEach((item, i) => {
        expect(item).to.eq(reward[i]);
      });
    });
  });

  describe('getActiveFilterFunction', () => {
    it('should return single function by default', () => {
      expect(getActiveFilterFunction('habit')).to.be.a('function');
      expect(getActiveFilterFunction('habit')).to.not.be.an('array');
    });

    it('should return single function for given filter type', () => {
      expect(getActiveFilterFunction('habit', 'yellowred')).to.be.a('function');
      expect(getActiveFilterFunction('habit', 'yellowred')).to.not.be.an('array');
    });

    it('should return default function for wrong filter type', () => {
      let defaultFunction = getActiveFilterFunction('habit');
      let errorToDefaultFunction = getActiveFilterFunction('habit', 'thisFilterDoesNotExist');
      expect(errorToDefaultFunction).to.eq(defaultFunction);
    });
  });
});

/* eslint-enable no-exclusive-tests */
