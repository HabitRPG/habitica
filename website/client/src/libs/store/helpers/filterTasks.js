import { shouldDo } from '@/../../common/script/cron';

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
      { label: 'due', filterFn: userPrefs => t => !t.completed && shouldDo(new Date(), t, userPrefs) },
      { label: 'notDue', filterFn: userPrefs => t => t.completed || !shouldDo(new Date(), t, userPrefs) },
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

export const getFilterLabels = filterLabel(taskFilters);

function activeFilter (filterList) {
  return (type, filterType = '') => {
    const filterListByType = filterList[type].filters;
    if (filterType) {
      return filterListByType.find(f => f.label === filterType);
    }
    return filterListByType.find(f => f.default === true);
  };
}

export const getActiveFilter = activeFilter(taskFilters);
