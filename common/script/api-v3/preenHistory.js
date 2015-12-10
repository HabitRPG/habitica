import moment from 'moment';
import _ from 'lodash';

function _preen (newHistory, history, amount, groupBy) {
  let groups = _.chain(history)
    .groupBy(h => moment(h.date).format(groupBy))
    .sortBy((h, k) => k)
    .value();

  groups = groups.slice(-amount);
  groups.pop();

  _.each(groups, (group) => {
    newHistory.push({
      date: moment(group[0].date).toDate(),
      value: _.reduce(group, (m, obj) => m + obj.value, 0) / group.length,
    });
  });
}

// Free users:
// Preen history for users with > 7 history entries
// This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
// of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
// of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
//
// Subscribers:
// TODO implement
export function preenHistory (history) {
  // TODO remember to add this to migration
  /* history = _.filter(history, function(h) {
    return !!h;
  }); */
  let newHistory = [];

  _preen(newHistory, history, 50, 'YYYY');
  _preen(newHistory, history, moment().format('MM'), 'YYYYMM');

  let thisMonth = moment().format('YYYYMM');
  newHistory = newHistory.concat(history.filter(h => {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));

  return newHistory;
}

export function preenUserHistory (user, tasksByType, minHistLen = 7) {
  tasksByType.habits.concat(user.dailys).forEach((task) => {
    if (task.history.length > minHistLen) {
      task.history = preenHistory(user, task.history);
      task.markModified('history');
    }
  });

  if (user.history.exp.length > minHistLen) {
    user.history.exp = preenHistory(user, user.history.exp);
    user.markModified('history.exp');
  }

  if (user.history.todos.length > minHistLen) {
    user.history.todos = preenHistory(user, user.history.todos);
    user.markModified('history.todos');
  }
}
