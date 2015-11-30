import { authWithHeaders } from '../../middlewares/api-v3/auth';
import * as Tasks from '../../models/task';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import Q from 'q';
import _ from 'lodash';

let api = {};

/**
 * @api {post} /tasks Create a new task
 * @apiVersion 3.0.0
 * @apiName CreateTask
 * @apiGroup Task
 *
 * @apiSuccess {Object} task The newly created task
 */
api.createTask = {
  method: 'POST',
  url: '/tasks',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkBody('type', res.t('invalidTaskType')).notEmpty().isIn(Tasks.tasksTypes);

    let user = res.locals.user;
    let taskType = req.body.type;

    let newTask = new Tasks[taskType](Tasks.Task.sanitize(req.body));
    newTask.userId = user._id;

    user.tasksOrder[taskType].unshift(newTask._id);

    Q.all([
      newTask.save(),
      user.save(),
    ])
    .then(([task]) => res.respond(201, task))
    .catch(next);
  },
};

/**
 * @api {get} /tasks Get an user's tasks
 * @apiVersion 3.0.0
 * @apiName GetTasks
 * @apiGroup Task
 *
 * @apiParam {string="habit","daily","todo","reward"} type Optional queyr parameter to return just a type of tasks
 *
 * @apiSuccess {Array} tasks An array of task objects
 */
api.getTasks = {
  method: 'GET',
  url: '/tasks',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkQuery('type', res.t('invalidTaskType')).isIn(Tasks.tasksTypes);

    let user = res.locals.user;
    let query = {userId: user._id};
    let type = req.query.type;
    if (type) query.type = type;

    Tasks.Task.find(query).exec()
      .then((tasks) => res.respond(200, tasks))
      .catch(next);
  },
};

/**
 * @api {get} /task/:taskId Get a task given its id
 * @apiVersion 3.0.0
 * @apiName GetTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 *
 * @apiSuccess {object} task The task object
 */
api.getTask = {
  method: 'GET',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      res.respond(200, task);
    })
    .catch(next);
  },
};

/**
 * @api {put} /task/:taskId Update a task
 * @apiVersion 3.0.0
 * @apiName UpdateTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 *
 * @apiSuccess {object} task The updated task
 */
api.updateTask = {
  method: 'PUT',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));

      // If checklist is updated -> replace the original one
      if (req.body.checklist) {
        delete req.body.checklist;
        task.checklist = req.body.checklist;
      }
      // TODO merge goes deep into objects, it's ok?
      // TODO also check that array fields are updated correctly without marking modified
      _.merge(task, Tasks.Task.sanitizeUpdate(req.body));
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask))
    .catch(next);
  },
};

/**
 * @api {post} /tasks/:taskId/checklist/addItem Add an item to a checklist, creating the checklist if it doesn't exist
 * @apiVersion 3.0.0
 * @apiName AddChecklistItem
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 *
 * @apiSuccess {object} task The updated task
 */
api.addChecklistItem = {
  method: 'POST',
  url: '/tasks/:taskId/checklist/addItem',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty and is an array

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

      task.checklist.push(req.body);
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask)) // TODO what to return
    .catch(next);
  },
};

/**
 * @api {post} /tasks/:taskId/checklist/:itemId/score Score a checklist item
 * @apiVersion 3.0.0
 * @apiName ScoreChecklistItem
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {object} task The updated task
 */
api.scoreCheckListItem = {
  method: 'POST',
  url: '/tasks/:taskId/checklist/:itemId/score',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

      let item = _.find(task.checklist, {_id: req.params.itemId});

      if (!item) throw new NotFound(res.t('checklistItemNotFound'));
      item.completed = !item.completed;
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask)) // TODO what to return
    .catch(next);
  },
};

/**
 * @api {put} /tasks/:taskId/checklist/:itemId Update a checklist item
 * @apiVersion 3.0.0
 * @apiName UpdateChecklistItem
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {object} task The updated task
 */
api.updateChecklistItem = {
  method: 'PUT',
  url: '/tasks/:taskId/checklist/:itemId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

      let item = _.find(task.checklist, {_id: req.params.itemId});
      if (!item) throw new NotFound(res.t('checklistItemNotFound'));

      delete req.body.id; // Simple sanitization to prevent the ID to be changed
      _.merge(item, req.body);
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask)) // TODO what to return
    .catch(next);
  },
};

/**
 * @api {delete} /tasks/:taskId/checklist/:itemId Remove a checklist item
 * @apiVersion 3.0.0
 * @apiName RemoveChecklistItem
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {object} empty An empty object
 */
api.removeChecklistItem = {
  method: 'DELETE',
  url: '/tasks/:taskId/checklist/:itemId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

      let itemI = _.findIndex(task.checklist, {_id: req.params.itemId});
      if (itemI === -1) throw new NotFound(res.t('checklistItemNotFound'));

      task.checklist.splice(itemI, 1);
      return task.save();
    })
    .then(() => res.respond(200, {})) // TODO what to return
    .catch(next);
  },
};

// Remove a task from user.tasksOrder
function _removeTaskTasksOrder (user, taskId) {
  // Loop through all lists and when the task is found, remove it and return
  for (let i = 0; i < Tasks.tasksTypes.length; i++) {
    let list = user.tasksOrder[Tasks.tasksTypes[i]];
    let index = list.indexOf(taskId);

    if (index !== -1) {
      list.splice(index, 1);
      break;
    }
  }

  return;
}

/**
 * @api {delete} /task/:taskId Delete a user task given its id
 * @apiVersion 3.0.0
 * @apiName DeleteTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 *
 * @apiSuccess {object} empty An empty object
 */
api.deleteTask = {
  method: 'GET',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.challenge.id) throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));

      _removeTaskTasksOrder(user, req.params.taskId);
      return Q.all([
        user.save(),
        task.remove(),
      ]);
    })
    .then(() => res.respond(200, {}))
    .catch(next);
  },
};

export default api;
