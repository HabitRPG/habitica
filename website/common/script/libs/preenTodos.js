import moment from 'moment';
import filter from 'lodash/filter';

// TODO used only in v2

export default function preenTodos (tasks) {
  return filter(tasks, t => !t.completed || t.challenge && t.challenge.id || moment(t.dateCompleted).isAfter(moment().subtract({ // eslint-disable-line
    days: 3,
  })));
}
