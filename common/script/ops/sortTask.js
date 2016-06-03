import i18n from '../i18n';
import preenTodos from '../libs/preenTodos';
import {
  NotFound,
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function sortTask (user, req = {}) {
  let id = _.get(req, 'params.id');
  let to = _.get(req, 'query.to');
  let fromParam = _.get(req, 'query.from');
  let taskType = _.get(req, 'params.taskType');

  let index = _.findIndex(user[`${taskType}s`], function findById (task) {
    return task._id === id;
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }
  if (to == null && fromParam == null) { // eslint-disable-line eqeqeq
    throw new BadRequest('?to=__&from=__ are required');
  }

  let tasks = user[`${taskType}s`];

  if (taskType === 'todo') {
    let preenedTasks = preenTodos(tasks);

    if (to !== -1) {
      to = tasks.indexOf(preenedTasks[to]);
    }

    fromParam = tasks.indexOf(preenedTasks[fromParam]);
  }

  let movedTask = tasks.splice(fromParam, 1)[0];

  if (to === -1) {
    tasks.push(movedTask);
  } else {
    tasks.splice(to, 0, movedTask);
  }

  return tasks;
};
