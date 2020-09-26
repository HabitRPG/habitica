import sortBy from 'lodash/sortBy';

// Task filter data
// @TODO find a way to include user preferences w.r.t sort and defaults
const taskFilters = {
  habit: {
    label: 'habits',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'yellowred', filterFn: t => t.value < 1 }, // weak
      { label: 'greenblue', filterFn: t => t.value >= 1 }, // strong
    ],
  },
  daily: {
    label: 'dailies',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'due', filterFn: t => !t.completed && t.isDue },
      { label: 'notDue', filterFn: t => t.completed || !t.isDue },
    ],
  },
  todo: {
    label: 'todos',
    filters: [
      { label: 'remaining', filterFn: t => !t.completed, default: true }, // active
      { label: 'scheduled', filterFn: t => !t.completed && t.date, sort: t => t.date },
      { label: 'complete2', filterFn: t => t.completed },
    ],
  },
  reward: {
    label: 'rewards',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'custom', filterFn: () => true }, // all rewards made by the user
      { label: 'wishlist', filterFn: () => false }, // not user tasks
    ],
  },
};

const challengeFilters = {
  habit: {
    label: 'habits',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
    ],
  },
  daily: {
    label: 'dailies',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
    ],
  },
  todo: {
    label: 'todos',
    filters: [
      { label: 'all', filterFn: () => true, default: true }, // active
      { label: 'scheduled', filterFn: t => t.date, sort: t => t.date },
    ],
  },
  reward: {
    label: 'rewards',
    filters: [
      { label: 'all', filterFn: () => true, default: true },
    ],
  },
};

function typeLabel (filterList) {
  return type => filterList[type].label;
}

export const getTypeLabel = typeLabel(taskFilters);

function filterLabel (filterList) {
  return type => {
    const filterListByType = filterList[type].filters;
    const filterListOfLabels = new Array(filterListByType.length);
    filterListByType.forEach(({ label }, i) => { filterListOfLabels[i] = label; });

    return filterListOfLabels;
  };
}

export function getFilterLabels (type, isChallenge) {
  if (isChallenge) {
    return filterLabel(challengeFilters)(type);
  }
  return filterLabel(taskFilters)(type);
}

function activeFilter (filterList) {
  return (type, filterType = '') => {
    const filterListByType = filterList[type].filters;
    if (filterType) {
      return filterListByType.find(f => f.label === filterType);
    }
    return filterListByType.find(f => f.default === true);
  };
}

export function getActiveFilter (type, filterType, isChallenge) {
  if (isChallenge) {
    return activeFilter(challengeFilters)(type, filterType);
  }
  return activeFilter(taskFilters)(type, filterType);
}

export function sortAndFilterTasks (tasks, selectedFilter) {
  let sortedTasks = tasks.filter(selectedFilter.filterFn);
  if (selectedFilter.sort) {
    sortedTasks = sortBy(sortedTasks, selectedFilter.sort);
  }
  return sortedTasks;
}
