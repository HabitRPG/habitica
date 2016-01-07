import _ from 'lodash';
import moment from 'moment';
/*
 Preen history for users with > 7 history entries
 This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
 of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
 of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
 */
function _preenHistory (history) {
  history = _.filter(history, h => {
    return Boolean(h); // filter missing entries
  });
  let newHistory = [];

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

export default function (user, minHistLen = 7) {
  _.each(user.habits.concat(user.dailys), (task, index) => {
    if (task.history && task.history.length > minHistLen) {
      task.history = _preenHistory(task.history);
      user.markModified(`user.${task.type}s.${index}.history`);
    }
  });

  _.defaults(user.history, {
    todos: [],
    exp: [],
  });

  if (user.history.exp.length > minHistLen) {
    user.history.exp = _preenHistory(user.history.exp);
    user.markModified('user.history.exp');
  }
  if (user.history.todos.length > minHistLen) {
    user.history.todos = _preenHistory(user.history.todos);
    user.markModified('user.history.todos');
  }
}
