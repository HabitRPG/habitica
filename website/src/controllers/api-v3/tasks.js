import { authWithHeaders } from '../../middlewares/api-v3/auth';
import webhook from '../../libs/api-v3/webhook';
import * as Tasks from '../../models/task';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import shared from '../../../../common';
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
// TODO should allow to create multiple tasks at once
// TODO gives problems when creating tasks concurrently because of how mongoose treats arrays (VersionErrors - treated as 500s)
api.createTask = {
  method: 'POST',
  url: '/tasks',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkBody('type', res.t('invalidTaskType')).notEmpty().isIn(Tasks.tasksTypes);

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let user = res.locals.user;
    let taskType = req.body.type;

    let newTask = new Tasks[taskType](Tasks.Task.sanitizeCreate(req.body));
    newTask.userId = user._id;

    user.tasksOrder[`${taskType}s`].unshift(newTask._id);

    Q.all([
      newTask.save(),
      user.save(),
    ])
    .then((results) => res.respond(201, results[0]))
    .catch(next);
  },
};

/**
 * @api {get} /tasks Get an user's tasks
 * @apiVersion 3.0.0
 * @apiName GetTasks
 * @apiGroup Task
 *
 * @apiParam {string="habit","daily","todo","reward"} type Optional query parameter to return just a type of tasks
 * @apiParam {boolean} includeCompletedTodos Optional query parameter to include completed todos when "type" is "todo"
 *
 * @apiSuccess {Array} tasks An array of task objects
 */
api.getTasks = {
  method: 'GET',
  url: '/tasks',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(Tasks.tasksTypes);

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let user = res.locals.user;
    let query = {userId: user._id};
    let type = req.query.type;

    if (type) {
      query.type = type;
      if (type === 'todo') query.completed = false; // Exclude completed todos
    } else {
      query.$or = [ // Exclude completed todos
        {type: 'todo', completed: false},
        {type: {$in: ['habit', 'daily', 'reward']}},
      ];
    }

    if (req.query.includeCompletedTodos === 'true' && (!type || type === 'todo')) {
      let queryCompleted = Tasks.Task.find({
        type: 'todo',
        completed: true,
      }).limit(30).sort({ // TODO add ability to pick more than 30 completed todos
        dateCompleted: 1,
      });

      Q.all([
        queryCompleted.exec(),
        Tasks.Task.find(query).exec(),
      ])
        .then((results) => res.respond(200, results[1].concat(results[0])))
        .catch(next);
    } else {
      Tasks.Task.find(query).exec()
        .then((tasks) => res.respond(200, tasks))
        .catch(next);
    }
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

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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
    // TODO make sure tags are updated correctly (they aren't set as modified!) maybe use specific routes

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));

      // If checklist is updated -> replace the original one
      if (req.body.checklist) {
        task.checklist = req.body.checklist;
        delete req.body.checklist;
      }

      // If tags are updated -> replace the original ones
      if (req.body.tags) {
        task.tags = req.body.tags;
        delete req.body.tags;
      }

      // TODO we have to convert task to an object because otherwise thigns doesn't get merged correctly, very bad for performances
      // TODO regarding comment above make sure other models with nested fields are using this trick too
      _.assign(task, _.merge(task.toObject(), Tasks.Task.sanitizeUpdate(req.body)));
      // TODO console.log(task.modifiedPaths(), task.toObject().repeat === tep)
      // repeat is always among modifiedPaths because mongoose changes the other of the keys when using .toObject()
      // see https://github.com/Automattic/mongoose/issues/2749
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask))
    .catch(next);
  },
};

function _generateWebhookTaskData (task, direction, delta, stats, user) {
  let extendedStats = _.extend(stats, {
    toNextLevel: shared.tnl(user.stats.lvl),
    maxHealth: shared.maxHealth,
    maxMP: user._statsComputed.maxMP, // TODO refactor as method not getter
  });

  let userData = {
    _id: user._id,
    _tmp: user._tmp,
    stats: extendedStats,
  };

  let taskData = {
    details: task,
    direction,
    delta,
  };

  return {
    task: taskData,
    user: userData,
  };
}

/**
 * @api {put} /tasks/score/:taskId/:direction Score a task
 * @apiVersion 3.0.0
 * @apiName ScoreTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {string="up","down"} direction The direction for scoring the task
 *
 * @apiSuccess {object} empty An empty object
 */
api.scoreTask = {
  method: 'POST',
  url: 'tasks/score/:taskId/:direction',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('direction', res.t('directionUpDown')).notEmpty().isIn(['up', 'down']);

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let user = res.locals.user;
    let direction = req.params.direction;

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));

      if (task.type === 'daily' || task.type === 'todo') {
        task.completed = direction === 'up';
      }

      let delta = user.ops.score({params: {id: task._id, direction}, language: req.language});

      return Q.all([
        user.save(),
        task.save(),
      ]).then((results) => {
        let savedUser = results[0];

        let userStats = savedUser.toJSON().stats;
        let resJsonData = _.extend({delta, _tmp: user._tmp}, userStats);
        res.respond(200, resJsonData);

        webhook.sendTaskWebhook(user.preferences.webhooks, _generateWebhookTaskData(task, direction, delta, userStats, user));

        // TODO sync challenge
      });
    })
    .catch(next);
  },
};

// completed todos cannot be moved, they'll be returned ordered by date of completion
// TODO check that it works when a tag is selected or todos are split between dated and due
/**
 * @api {post} /tasks/move/:taskId/to/:position Move a task to a new position
 * @apiVersion 3.0.0
 * @apiName MoveTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {Number} position Where to move the task (-1 means push to bottom)
 *
 * @apiSuccess {object} empty An empty object
 */
api.moveTask = {
  method: 'POST',
  url: '/tasks/move/:taskId/to/:position',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    let user = res.locals.user;
    let to = Number(req.params.position);

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.type === 'todo' && task.completed) throw new NotFound(res.t('cantMoveCompletedTodo'));
      let order = user.tasksOrder[`${task.type}s`];
      let currentIndex = order.indexOf(task._id);

      // If for some reason the task isn't ordered (should never happen)
      // or if the task is moved to a non existing position
      // or if the task is moved to postion -1 (push to bottom)
      // -> push task at end of list
      if (currentIndex === -1 || !order[to] || to === -1) {
        order.push(task._id);
      } else {
        let taskToMove = order.splice(currentIndex, 1)[0];
        order.splice(to, 0, taskToMove);
      }

      return user.save();
    })
    .then(() => res.respond(200, {})) // TODO what to return
    .catch(next);
  },
};

/**
 * @api {post} /tasks/:taskId/checklist Add an item to a checklist, creating the checklist if it doesn't exist
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
  url: '/tasks/:taskId/checklist',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty and is an array

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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

/**
 * @api {post} /tasks/:taskId/tags/:tagId Add a tag to a task
 * @apiVersion 3.0.0
 * @apiName AddTagToTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {UUID} tagId The tag id
 *
 * @apiSuccess {object} task The updated task
 */
api.addTagToTask = {
  method: 'POST',
  url: '/tasks/:taskId/tags',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    let userTags = user.tags.map(tag => tag._id);
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID().isIn(userTags);

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));
      let tagId = req.params.tagId;

      let alreadyTagged = task.tags.indexOf(tagId) === -1;
      if (alreadyTagged) throw new BadRequest(res.t('alreadyTagged'));

      task.tags.push(tagId);
      return task.save();
    })
    .then((savedTask) => res.respond(200, savedTask)) // TODO what to return
    .catch(next);
  },
};

/**
 * @api {delete} /tasks/:taskId/tags/:tagId Remove a tag
 * @apiVersion 3.0.0
 * @apiName RemoveTagFromTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {UUID} tagId The tag id
 *
 * @apiSuccess {object} empty An empty object
 */
api.removeTagFromTask = {
  method: 'DELETE',
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec()
    .then((task) => {
      if (!task) throw new NotFound(res.t('taskNotFound'));

      let tagI = _.findIndex(task.tags, {_id: req.params.tagId});
      if (tagI === -1) throw new NotFound(res.t('tagNotFound'));

      task.tags.splice(tagI, 1);
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
    let list = user.tasksOrder[`${Tasks.tasksTypes[i]}s`];
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
  method: 'DELETE',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

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
