import i18n from '../i18n';
import preenTodos from '../libs/preenTodos';
import {
  NotFound,
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function sortTag (user, req = {}) {
  let id = _.get(req, 'params.id');
  let to = _.get(req, 'query.to');
  let fromParam = _.get(req, 'query.from');

  let task = user.tasks[id];

  if (!task) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }
  if (!to && !fromParam) {
    throw new BadRequest('?to=__&from=__ are required');
  }

  let tasks = user[`${task.type}s`];

  if (task.type === 'todo' && tasks[fromParam] !== task) {
    let preenedTasks = preenTodos(tasks);

    if (to !== -1) {
      to = tasks.indexOf(preenedTasks[to]);
    }

    fromParam = tasks.indexOf(preenedTasks[fromParam]);
  }

  if (tasks[fromParam] !== task) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }

  let movedTask = tasks.splice(fromParam, 1)[0];

  if (to === -1) {
    tasks.push(movedTask);
  } else {
    tasks.splice(to, 0, movedTask);
  }

  return tasks;
};
