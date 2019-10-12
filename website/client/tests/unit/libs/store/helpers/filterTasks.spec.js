import {
  getTypeLabel,
  getFilterLabels,
  getActiveFilter,
} from '@/libs/store/helpers/filterTasks';

describe('Filter Category for Tasks', () => {
  describe('getTypeLabel', () => {
    it('should return correct task type labels', () => {
      expect(getTypeLabel('habit')).to.eq('habits');
      expect(getTypeLabel('daily')).to.eq('dailies');
      expect(getTypeLabel('todo')).to.eq('todos');
      expect(getTypeLabel('reward')).to.eq('rewards');
    });
  });

  describe('getFilterLabels', () => {
    let habit; let daily; let todo; let
      reward;
    beforeEach(() => {
      habit = ['all', 'yellowred', 'greenblue'];
      daily = ['all', 'due', 'notDue'];
      todo = ['remaining', 'scheduled', 'complete2'];
      reward = ['all', 'custom', 'wishlist'];
    });

    it('should return all task type filter labels by type', () => {
      // habits
      getFilterLabels('habit').forEach((item, i) => {
        expect(item).to.eq(habit[i]);
      });
      // dailys
      getFilterLabels('daily').forEach((item, i) => {
        expect(item).to.eq(daily[i]);
      });
      // todos
      getFilterLabels('todo').forEach((item, i) => {
        expect(item).to.eq(todo[i]);
      });
      // rewards
      getFilterLabels('reward').forEach((item, i) => {
        expect(item).to.eq(reward[i]);
      });
    });
  });

  describe('getActiveFilter', () => {
    it('should return single function by default', () => {
      const activeFilter = getActiveFilter('habit');
      expect(activeFilter).to.be.an('object');
      expect(activeFilter).to.have.all.keys('label', 'filterFn', 'default');
      expect(activeFilter.default).to.be.true;
    });

    it('should return single function for given filter type', () => {
      const activeFilterLabel = 'yellowred';
      const activeFilter = getActiveFilter('habit', activeFilterLabel);
      expect(activeFilter).to.be.an('object');
      expect(activeFilter).to.have.all.keys('label', 'filterFn');
      expect(activeFilter.label).to.eq(activeFilterLabel);
    });
  });
});
