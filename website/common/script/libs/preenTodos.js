import moment from 'moment';
import _ from 'lodash';

// TODO used only in v2

module.exports = function preenTodos (tasks) {
  return _.filter(tasks, (t) => {
    return !t.completed || t.challenge && t.challenge.id || moment(t.dateCompleted).isAfter(moment().subtract({
      days: 3,
    }));
  });
};
