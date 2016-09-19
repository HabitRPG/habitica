import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import moment from 'moment';

// Even though Mongoose handles task defaults, we want to make sure defaults are set on the client-side before
// sending up to the server for performance

// TODO move to client code?

const tasksTypes = ['habit', 'daily', 'todo', 'reward'];

module.exports = function taskDefaults (task = {}) {
  if (!task.type || tasksTypes.indexOf(task.type) === -1) {
    task.type = 'habit';
  }

  let defaultId = uuid();
  let defaults = {
    _id: defaultId,
    text: task._id || defaultId,
    notes: '',
    tags: [],
    value: task.type === 'reward' ? 10 : 0,
    priority: 1,
    challenge: {},
    reminders: [],
    attribute: 'str',
    createdAt: new Date(), // TODO these are going to be overwritten by the server...
    updatedAt: new Date(),
  };

  _.defaults(task, defaults);

  if (task.type === 'habit' || task.type === 'daily') {
    _.defaults(task, {
      history: [],
    });
  }

  if (task.type === 'todo' || task.type === 'daily') {
    _.defaults(task, {
      completed: false,
      collapseChecklist: false,
      checklist: [],
    });
  }

  if (task.type === 'habit') {
    _.defaults(task, {
      up: true,
      down: true,
    });
  }

  if (task.type === 'daily') {
    _.defaults(task, {
      streak: 0,
      repeat: {
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true,
        su: true,
      },
      startDate: moment().startOf('day').toDate(),
      everyX: 1,
      frequency: 'weekly',
    });
  }

  return task;
};
