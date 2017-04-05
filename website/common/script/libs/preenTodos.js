import moment from 'moment';
import filter from 'lodash/filter';

// TODO used only in v2

module.exports = function preenTodos (tasks) {
  return filter(tasks, (t) => {
    return !t.completed || t.challenge && t.challenge.id || moment(t.dateCompleted).isAfter(moment().subtract({
      days: 3,
    }));
  });
};
