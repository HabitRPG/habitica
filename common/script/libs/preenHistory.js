import moment from 'moment';
import _ from 'lodash';

/*
Preen history for users with > 7 history entries
This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 1 entry each week
of this month; 1 entry for each month of this year; 1 entry per previous year: [day*7 week*4 month*12 year*infinite]
 */

module.exports = function(history) {
  var newHistory, preen, thisMonth;
  history = _.filter(history, function(h) {
    return !!h;
  });
  newHistory = [];
  preen = function(amount, groupBy) {
    var groups;
    groups = _.chain(history).groupBy(function(h) {
      return moment(h.date).format(groupBy);
    }).sortBy(function(h, k) {
      return k;
    }).value();
    groups = groups.slice(-amount);
    groups.pop();
    return _.each(groups, function(group) {
      newHistory.push({
        date: moment(group[0].date).toDate(),
        value: _.reduce(group, (function(m, obj) {
          return m + obj.value;
        }), 0) / group.length
      });
      return true;
    });
  };
  preen(50, "YYYY");
  preen(moment().format('MM'), "YYYYMM");
  thisMonth = moment().format('YYYYMM');
  newHistory = newHistory.concat(_.filter(history, function(h) {
    return moment(h.date).format('YYYYMM') === thisMonth;
  }));
  return newHistory;
};
