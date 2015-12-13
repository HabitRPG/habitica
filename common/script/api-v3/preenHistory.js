import moment from 'moment';
import _ from 'lodash';

function _preen (newHistory, history, amount, groupBy) {
  _.chain(history)
    .groupBy(h => moment(h.date).format(groupBy))
    .sortBy((h, k) => k)
    .slice(-amount)
    .pop()
    .each((group) => {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, (m, obj) => m + obj.value, 0) / group.length,
      });
    })
    .value();
}

// Free users:
//  Preen history for users with > 7 history entries
//  This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
//  of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
//  of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
//
// Subscribers:
//  TODO implement

// TODO Probably the description ^ is not too correct, this method actually takes 1 value each for the last 50 years,
// then the X last months, where X is the month we're in (september = 8 starting from 0)
// and all the days in this month
// Allowing for multiple values in a single day for habits we probably want something different:
// For free users:
// - At max 30 values for today (max 30)
// - 1 value each for the previous 61 days (2 months)
// - 1 value each for the previous 10 months (max 10)
// - 1 value each for the previous 50 years
// - Total: 30+61+10+ a few years ~= 105
//
// For subscribed users
// - At max 30 values for today (max 30)
// - 1 value each for the previous 364 days (max 364)
// - 1 value each for the previous 12 months (max 12)
// - 1 value each for the previous 50 years
// - Total: 30+364+12+ a few years ~= 410
//
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
