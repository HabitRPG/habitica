import moment from 'moment';
import _ from 'lodash';

/*
  Preen 3-day past-completed To-Dos from Angular & mobile app
 */

module.exports = function(tasks) {
  return _.filter(tasks, function(t) {
    return !t.completed || (t.challenge && t.challenge.id) || moment(t.dateCompleted).isAfter(moment().subtract({
      days: 3
    }));
  });
};
