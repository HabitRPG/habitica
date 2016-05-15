import _ from 'lodash';
import moment from 'moment';

// Aggregate entries
function _aggregate (history, aggregateBy) {
  return _.chain(history)
    .groupBy(entry => { // group entries by aggregateBy
      return moment(entry.date).format(aggregateBy);
    })
    .sortBy((entry, key) => key) // sort by date
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
  // history = _.filter(history, historyEntry => Boolean(historyEntry)); // Filter missing entries
  let now = timezoneOffset ? moment().zone(timezoneOffset) : moment();
  // Date after which to begin compressing data
  let cutOff = now.subtract(isSubscribed ? 365 : 60, 'days').startOf('day');

  // Keep uncompressed entries (modifies history and returns removed items)
  let newHistory = _.remove(history, entry => {
    let date = moment(entry.date);
    return date.isSame(cutOff) || date.isAfter(cutOff);
  });

  // Date after which to begin compressing data by year
  let monthsCutOff = cutOff.subtract(isSubscribed ? 12 : 10, 'months').startOf('day');
  let aggregateByMonth = _.remove(history, entry => {
    let date = moment(entry.date);
    return date.isSame(monthsCutOff) || date.isAfter(monthsCutOff);
  });
  // Aggregate remaining entries by month and year
  if (aggregateByMonth.length > 0) newHistory.unshift(..._aggregate(aggregateByMonth, 'YYYYMM'));
  if (history.length > 0) newHistory.unshift(..._aggregate(history, 'YYYY'));

  return newHistory;
}

// Preen history for users and tasks.
export function preenUserHistory (user, tasksByType) {
  let isSubscribed = user.isSubscribed();
  let timezoneOffset = user.preferences.timezoneOffset;
  let minHistoryLength = isSubscribed ? 365 : 60;

  function _processTask (task) {
    if (task.history && task.history.length > minHistoryLength) {
      task.history = preenHistory(task.history, isSubscribed, timezoneOffset);
      task.markModified('history');
    }
  }

  tasksByType.habits.forEach(_processTask);
  tasksByType.dailys.forEach(_processTask);

  if (user.history.exp.length > minHistoryLength) {
    user.history.exp = preenHistory(user.history.exp, isSubscribed, timezoneOffset);
    user.markModified('history.exp');
  }

  if (user.history.todos.length > minHistoryLength) {
    user.history.todos = preenHistory(user.history.todos, isSubscribed, timezoneOffset);
    user.markModified('history.todos');
  }
}
