import _ from 'lodash';
import moment from 'moment';

/*
 Preen history for users and tasks. This code runs only on the server.

 Free users:
 - 1 value for each day of the past 60 days (no compression)
 - 1 value each month for the previous 10 months
 - 1 value each year for the previous years

 Subscribers:
 - 1 value for each day of the past 365 days (no compression)
 - 1 value each month for the previous 12 months
 - 1 value each year for the previous years
 */


function _preenHistory (history, isSubscribed) {
  history = _.filter(history, historyEntry => return Boolean(historyEntry)); // Filter missing entries
  let newHistory = [];

  // Steps
  // Take first 365 or 60 entries and keep them unmodified - only if of consecutive days? In the long term we want history to be continuous not with big jumps
  // Group the rest by month and keep 10 or 12
  // Group the rest by year
  
  function _preen (amount, groupBy) {
    let groups = _.chain(history).groupBy(h => {
      return moment(h.date).format(groupBy);
    }).sortBy((h, k) => {
      return k;
    }).value();
    groups = groups.slice(-amount);
    groups.pop();

    return _.each(groups, group => {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, (m, obj) => {
          return m + obj.value;
        }, 0) / group.length,
      });
    });
  }

  _preen(50, 'YYYY');
  _preen(moment().format('MM'), 'YYYYMM');

  let thisMonth = moment().format('YYYYMM');
  newHistory = newHistory.concat(_.filter(history, h => {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));

  return newHistory;
}

export default function (user) {
  let isSubscribed = user.purchased && user.purchased.plan && user.purchased.plan.customerId;
  let minHistoryLength = isSubscribed ? 365 : 60;

  _.each(user.habits.concat(user.dailys), (task, index) => {
    if (task.history && task.history.length > minHistoryLength) {
      task.history = _preenHistory(task.history, isSubscribed);
      user.markModified(`user.${task.type}s.${index}.history`);
    }
  });

  _.defaults(user.history, {
    todos: [],
    exp: [],
  });

  if (user.history.exp.length > minHistoryLength) {
    user.history.exp = _preenHistory(user.history.exp, isSubscribed);
    user.markModified('user.history.exp');
  }

  if (user.history.todos.length > minHistoryLength) {
    user.history.todos = _preenHistory(user.history.todos, isSubscribed);
    user.markModified('user.history.todos');
  }
}
