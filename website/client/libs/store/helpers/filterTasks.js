import { shouldDo } from 'common/script/cron';

import isEmpty from 'lodash/isEmpty';

// Task filter data
// @TODO find a way to include user preferences w.r.t sort and defaults
const taskFilters = {
  habit: {
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'yellowred', filterFn: t => t.value < 1 }, // weak
      { label: 'greenblue', filterFn: t => t.value >= 1 }, // strong
    ],
  },
  daily: {
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'due', filterFn: userPrefs => t => !t.completed && shouldDo(new Date(), t, userPrefs) },
      { label: 'notDue', filterFn: userPrefs => t => t.completed || !shouldDo(new Date(), t, userPrefs) },
    ],
  },
  todo: {
    filters: [
      { label: 'remaining', filterFn: t => !t.completed, default: true }, // active
      { label: 'scheduled', filterFn: t => !t.completed && t.date, sort: t => t.date },
      { label: 'complete2', filterFn: t => t.completed },
    ],
  },
  reward: {
    filters: [
      { label: 'all', filterFn: () => true, default: true },
      { label: 'custom', filterFn: () => true }, // all rewards made by the user
      { label: 'wishlist', filterFn: () => false }, // not user tasks
    ],
  },
};

function filterLabel (filterList) {
  return (type) => {
    let filterListByType = filterList[type].filters;
    let filterListOfLabels = new Array(filterListByType.length);
    filterListByType.forEach(({ label }, i) => filterListOfLabels[i] = label);

    return filterListOfLabels;
  };
}

const getFilterLabels = filterLabel(taskFilters);

function activeFilterFunction (filterList) {
  return (type, filterType = '') => {
    let filterListByType = filterList[type].filters;
    if (isEmpty(filterType)) {
      return filterListByType.find(f => f.default === true).filterFn;
    } else {
      // check if filter type is available, else send default filter
      let filterFunction = filterListByType.find(f => f.label === filterType);
      if (isEmpty(filterFunction)) {
        return filterListByType.find(f => f.default === true).filterFn;
      } else {
        return filterFunction.filterFn;
      }
    }
  };
}

const getActiveFilterFunction = activeFilterFunction(taskFilters);

export {
  getFilterLabels,
  getActiveFilterFunction,
};
