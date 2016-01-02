import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { sendTaskWebhook } from '../../libs/api-v3/webhook';
import * as Tasks from '../../models/task';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import shared from '../../../../common';
import Q from 'q';
import _ from 'lodash';
import scoreTask from '../../../../common/script/api-v3/scoreTask';
import { preenHistory } from '../../../../common/script/api-v3/preenHistory';

let api = {};

/**
 * @api {post} /tasks Create a new task. Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiVersion 3.0.0
 * @apiName CreateTask
 * @apiGroup Task
 *
 * @apiSuccess {Object|Array} task The newly created task(s)
 */
api.createTask = {
  method: 'POST',
  url: '/tasks',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let tasksData = Array.isArray(req.body) ? req.body : [req.body];
    let user = res.locals.user;

    let toSave = tasksData.map(taskData => {
      if (!taskData || Tasks.tasksTypes.indexOf(taskData.type) === -1) throw new BadRequest(res.t('invalidTaskType'));

      let taskType = taskData.type;
      let newTask = new Tasks[taskType](Tasks.Task.sanitizeCreate(taskData));
      newTask.userId = user._id;
      user.tasksOrder[`${taskType}s`].unshift(newTask._id);

      return newTask.save();
    });

    toSave.unshift(user.save());
    let results = await Q.all(toSave);

    if (results.length === 2) { // Just one task created
      res.respond(201, results[1]);
    } else {
      results.splice(0, 1); // remove the user
      res.respond(201, results);
    }
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(Tasks.tasksTypes);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

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

      let results = await Q.all([
        queryCompleted.exec(),
        Tasks.Task.find(query).exec(),
      ]);

      res.respond(200, results[1].concat(results[0]));
    } else {
      let tasks = await Tasks.Task.find(query).exec();
      res.respond(200, tasks);
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    res.respond(200, task);
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty
    // TODO make sure tags are updated correctly (they aren't set as modified!) maybe use specific routes

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

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

    let savedTask = await task.save();
    res.respond(200, savedTask);
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
 * @api {put} /tasks/:taskId/score/:direction Score a task
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
  url: '/tasks/:taskId/score/:direction',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('direction', res.t('directionUpDown')).notEmpty().isIn(['up', 'down']); // TODO what about rewards? maybe separate route?

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let direction = req.params.direction;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));

    let wasCompleted = task.completed;
    if (task.type === 'daily' || task.type === 'todo') {
      task.completed = direction === 'up'; // TODO move into scoreTask
    }

    let delta = scoreTask({task, user, direction}, req);
    // Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
    if (direction === 'up') user.fns.randomDrop({task, delta}, req);

    // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
    if (task.type === 'todo') {
      if (!wasCompleted && task.completed) {
        let i = user.tasksOrder.todos.indexOf(task._id);
        if (i !== -1) user.tasksOrder.todos.splice(i, 1);
      } else if (wasCompleted && !task.completed) {
        let i = user.tasksOrder.todos.indexOf(task._id);
        if (i === -1) {
          user.tasksOrder.todos.push(task._id); // TODO push at the top?
        } else { // If for some reason it hadn't been removed TODO ok?
          user.tasksOrder.todos.splice(i, 1);
          user.tasksOrder.push(task._id);
        }
      }
    }

    let results = await Q.all([
      user.save(),
      task.save(),
    ]);

    let savedUser = results[0];

    let userStats = savedUser.stats.toJSON();
    let resJsonData = _.extend({delta, _tmp: user._tmp}, userStats);
    res.respond(200, resJsonData);

    sendTaskWebhook(user.preferences.webhooks, _generateWebhookTaskData(task, direction, delta, userStats, user));

    // TODO test?
    if (task.challenge.id && task.challenge.taskId && !task.challenge.broken && task.type !== 'reward') {
      // Wrapping everything in a try/catch block because if an error occurs using `await` it MUST NOT bubble up because the request has already been handled
      try {
        let chalTask = await Tasks.Task.findOne({
          _id: task.challenge.taskId,
        }).exec();

        chalTask.value += delta;
        if (chalTask.type === 'habit' || chalTask.type === 'daily') {
          chalTask.history.push({value: chalTask.value, date: Number(new Date())});
          // TODO 1. treat challenges as subscribed users for preening 2. it's expensive to do it at every score - how to have it happen once like for cron?
          chalTask.history = preenHistory(user, chalTask.history);
          chalTask.markModified('history');
        }

        await chalTask.save();
      } catch (e) {
        // TODO handle
      }
    }
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let to = Number(req.params.position);

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

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

    await user.save();
    res.respond(200, {}); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty and is an array

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    task.checklist.push(Tasks.Task.sanitizeChecklist(req.body));
    let savedTask = await task.save();

    res.respond(200, savedTask); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let item = _.find(task.checklist, {_id: req.params.itemId});

    if (!item) throw new NotFound(res.t('checklistItemNotFound'));
    item.completed = !item.completed;
    let savedTask = await task.save();

    res.respond(200, savedTask); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let item = _.find(task.checklist, {_id: req.params.itemId});
    if (!item) throw new NotFound(res.t('checklistItemNotFound'));

    _.merge(item, Tasks.Task.sanitizeChecklist(req.body));
    let savedTask = await task.save();

    res.respond(200, savedTask); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let itemI = _.findIndex(task.checklist, {_id: req.params.itemId});
    if (itemI === -1) throw new NotFound(res.t('checklistItemNotFound'));

    task.checklist.splice(itemI, 1);

    await task.save();
    res.respond(200, {}); // TODO what to return
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
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    let userTags = user.tags.map(tag => tag._id);
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID().isIn(userTags);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    let tagId = req.params.tagId;

    let alreadyTagged = task.tags.indexOf(tagId) !== -1;
    if (alreadyTagged) throw new BadRequest(res.t('alreadyTagged'));

    task.tags.push(tagId);

    let savedTask = await task.save();
    res.respond(200, savedTask); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));

    let tagI = task.tags.indexOf(req.params.tagId);
    if (tagI === -1) throw new NotFound(res.t('tagNotFound'));

    task.tags.splice(tagI, 1);

    await task.save();
    res.respond(200, {}); // TODO what to return
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
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.challenge.id) throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));

    _removeTaskTasksOrder(user, req.params.taskId);
    await Q.all([user.save(), task.remove()]);

    res.respond(200, {});
  },
};

export default api;
