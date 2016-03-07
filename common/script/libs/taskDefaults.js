import uuid from './uuid';
import _ from 'lodash';

/*
Even though Mongoose handles task defaults, we want to make sure defaults are set on the client-side before
sending up to the server for performance
 */

// TODO revisit

module.exports = function(task) {
  var defaults, ref, ref1, ref2;
  if (task == null) {
    task = {};
  }
  if (!(task.type && ((ref = task.type) === 'habit' || ref === 'daily' || ref === 'todo' || ref === 'reward'))) {
    task.type = 'habit';
  }
  defaults = {
    id: uuid(),
    text: task.id != null ? task.id : '',
    notes: '',
    priority: 1,
    challenge: {},
    attribute: 'str',
    dateCreated: new Date()
  };
  _.defaults(task, defaults);
  if (task.type === 'habit') {
    _.defaults(task, {
      up: true,
      down: true
    });
  }
  if ((ref1 = task.type) === 'habit' || ref1 === 'daily') {
    _.defaults(task, {
      history: []
    });
  }
  if ((ref2 = task.type) === 'daily' || ref2 === 'todo') {
    _.defaults(task, {
      completed: false
    });
  }
  if (task.type === 'daily') {
    _.defaults(task, {
      streak: 0,
      repeat: {
        su: true,
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true
      }
    }, {
      startDate: new Date(),
      everyX: 1,
      frequency: 'weekly'
    });
  }
  task._id = task.id;
  if (task.value == null) {
    task.value = task.type === 'reward' ? 10 : 0;
  }
  if (!_.isNumber(task.priority)) {
    task.priority = 1;
  }
  return task;
};
