import _ from 'lodash';
import moment from 'moment';

// Aggregate entries
function _aggregate (history, aggregateBy) {
  return _.chain(history)
    .groupBy(entry => { // group entries by aggregateBy
      return moment(entry.date).format(aggregateBy);
    })
    .sortBy((entry, key) => key) // sort by date
    .reverse() // sort from most to least recent
    .map(entries => {
      return {
        date: Number(entries[0].date),
        value: _.reduce(entries, (previousValue, entry) => {
          return previousValue + entry.value;
        }, 0) / entries.length,
      };
    })
    .value();
}

/* Preen an array of history entries

Free users:
- 1 value for each day of the past 60 days (no compression)
- 1 value each month for the previous 10 months
- 1 value each year for the previous years

Subscribers and challenges:
- 1 value for each day of the past 365 days (no compression)
- 1 value each month for the previous 12 months
- 1 value each year for the previous years
 */
export function preenHistory (history, isSubscribed, timezoneOffset) {
  history = _.filter(history, historyEntry => Boolean(historyEntry)); // Filter missing entries
  let now = timezoneOffset ? moment().zone(timezoneOffset) : moment();
  // Date after which to begin compressing data
  let cutOff = now.subtract(isSubscribed ? 365 : 60, 'days').startOf('day');

  // Keep uncompressed entries (modifies history)
  let newHistory = _.remove(history, entry => {
    return moment(entry.date).isSameOrAfter(cutOff);
  });

  // Date after which to begin compressing data by year
  let monthsCutOff = cutOff.subtract(isSubscribed ? 12 : 10, 'months').startOf('day');
  let aggregateByMonth = _.remove(history, entry => {
    return moment(entry.date).isSameOrAfter(monthsCutOff);
  });
  // Aggregate remaining entries by month and year
  newHistory.push(..._aggregate(aggregateByMonth, 'YYYYMM'));
  newHistory.push(..._aggregate(history, 'YYYY'));

  return newHistory;
}

// Preen history for users and tasks. This code runs only on the server.
export function preenUserHistory (user) {
  let isSubscribed = user.purchased && user.purchased.plan && user.purchased.plan.customerId;
  let minHistoryLength = isSubscribed ? 365 : 60;

  _.each(user.habits.concat(user.dailys), (task, index) => {
    if (task.history && task.history.length > minHistoryLength) {
      task.history = preenHistory(task.history, isSubscribed);
      if (user.markModified) user.markModified(`${task.type}s.${index}.history`);
    }
  });

  _.defaults(user.history, {
    todos: [],
    exp: [],
  });

  if (user.history.exp.length > minHistoryLength) {
    user.history.exp = preenHistory(user.history.exp, isSubscribed);
    user.markModified('history.exp');
  }

  if (user.history.todos.length > minHistoryLength) {
    user.history.todos = preenHistory(user.history.todos, isSubscribed);
    user.markModified('history.todos');
  }
}
