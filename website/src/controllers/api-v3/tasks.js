import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { sendTaskWebhook } from '../../libs/api-v3/webhook';
import { removeFromArray } from '../../libs/api-v3/collectionManipulators';
import * as Tasks from '../../models/task';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import common from '../../../../common';
import Q from 'q';
import _ from 'lodash';

let api = {};

// challenge must be passed only when a challenge task is being created
async function _createTasks (req, res, user, challenge) {
  let toSave = Array.isArray(req.body) ? req.body : [req.body];

  toSave = toSave.map(taskData => {
    // Validate that task.type is valid
    if (!taskData || Tasks.tasksTypes.indexOf(taskData.type) === -1) throw new BadRequest(res.t('invalidTaskType'));

    let taskType = taskData.type;
    let newTask = new Tasks[taskType](Tasks.Task.sanitizeCreate(taskData));

    if (challenge) {
      newTask.challenge.id = challenge.id;
    } else {
      newTask.userId = user._id;
    }

    // Validate that the task is valid and throw if it isn't
    // otherwise since we're saving user/challenge and task in parallel it could save the user/challenge with a tasksOrder that doens't match reality
    let validationErrors = newTask.validateSync();
    if (validationErrors) throw validationErrors;

    // Otherwise update the user/challenge
    (challenge || user).tasksOrder[`${taskType}s`].unshift(newTask._id);

    return newTask;
  }).map(task => task.save({ // If all tasks are valid (this is why it's not in the previous .map()), save everything, withough running validation again
    validateBeforeSave: false,
  }));

  toSave.unshift((challenge || user).save());

  let tasks = await Q.all(toSave);
  tasks.splice(0, 1); // Remove user or challenge
  return tasks;
}

/**
 * @api {post} /tasks/user Create a new task belonging to the autheticated user. Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiVersion 3.0.0
 * @apiName CreateUserTasks
 * @apiGroup Task
 *
 * @apiSuccess {Object} task The newly created task
 * @apiSuccess {Object[]} tasks The newly created tasks (if more than one was created)
 */
api.createUserTasks = {
  method: 'POST',
  url: '/tasks/user',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let tasks = await _createTasks(req, res, res.locals.user);
    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);
  },
};

/**
 * @api {post} /tasks/challenge/:challengeId Create a new task belonging to the challenge. Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiVersion 3.0.0
 * @apiName CreateChallengeTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} challengeId The id of the challenge the new task(s) will belong to.
 *
 * @apiSuccess {Object} task The newly created task
 * @apiSuccess {Object[]} tasks The newly created tasks (if more than one was created)
 */
api.createChallengeTasks = {
  method: 'POST',
  url: '/tasks/challenge/:challengeId', // TODO should be /tasks/challengeS/:challengeId ? plural?
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findOne({_id: challengeId}).exec();

    // If the challenge does not exist, or if it exists but user is not the leader -> throw error
    if (!challenge || user.challenges.indexOf(challengeId) === -1) throw new NotFound(res.t('challengeNotFound'));
    if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));

    let tasks = await _createTasks(req, res, user, challenge);

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    // If adding tasks to a challenge -> sync users
    if (challenge) challenge.addTasks(tasks); // TODO catch/log
  },
};

// challenge must be passed only when a challenge task is being created
async function _getTasks (req, res, user, challenge) {
  let query = challenge ? {'challenge.id': challenge.id, userId: {$exists: false}} : {userId: user._id};
  let type = req.query.type;

  if (type) {
    if (type === 'todos') {
      query.completed = false; // Exclude completed todos
    } else if (type === 'completedTodos') {
      query = Tasks.Task.find({
        userId: user._id,
        type: 'todo',
        completed: true,
      }).limit(30).sort({ // TODO add ability to pick more than 30 completed todos
        dateCompleted: 1,
      });
    } else {
      query.type = type.slice(0, -1); // removing the final "s"
    }
  } else {
    query.$or = [ // Exclude completed todos
      {type: 'todo', completed: false},
      {type: {$in: ['habit', 'daily', 'reward']}},
    ];
  }

  let tasks = await Tasks.Task.find(query).exec();

  // Order tasks based on tasksOrder
  if (type && type !== 'completedTodos') {
    let order = (challenge || user).tasksOrder[type];
    let orderedTasks = new Array(tasks.length);
    let unorderedTasks = []; // what we want to add later

    tasks.forEach((task, index) => {
      let taskId = task._id;
      let i = order[index] === taskId ? index : order.indexOf(taskId);
      if (i === -1) {
        unorderedTasks.push(task);
      } else {
        orderedTasks[i] = task;
      }
    });

    // Remove empty values from the array and add any unordered task
    orderedTasks = _.compact(orderedTasks).concat(unorderedTasks);
    res.respond(200, orderedTasks);
  } else {
    res.respond(200, tasks);
  }
}

/**
 * @api {get} /tasks/user Get an user's tasks
 * @apiVersion 3.0.0
 * @apiName GetUserTasks
 * @apiGroup Task
 *
 * @apiParam {string="habits","dailys","todos","rewards","completedTodos"} type Optional query parameter to return just a type of tasks. By default all types will be returned except completed todos that requested separately.
 *
 * @apiSuccess {Array} tasks An array of task objects
 */
api.getUserTasks = {
  method: 'GET',
  url: '/tasks/user',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let types = Tasks.tasksTypes.map(type => `${type}s`);
    types.push('completedTodos');
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(types);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    await _getTasks(req, res, res.locals.user);
  },
};

/**
 * @api {get} /tasks/challenge/:challengeId Get a challenge's tasks
 * @apiVersion 3.0.0
 * @apiName GetChallengeTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} challengeId The id of the challenge from which to retrieve the tasks.
 * @apiParam {string="habits","dailys","todos","rewards"} type Optional query parameter to return just a type of tasks
 *
 * @apiSuccess {Array} tasks An array of task objects
 */
api.getChallengeTasks = {
  method: 'GET',
  url: '/tasks/challenge/:challengeId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    let types = Tasks.tasksTypes.map(type => `${type}s`);
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(types);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findOne({_id: challengeId}).select('group leader tasksOrder').exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    await _getTasks(req, res, res.locals.user, challenge);
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
    }).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      let challenge = await Challenge.find({_id: task.challenge.id}).select('leader').exec();
      if (!challenge || (user.challenges.indexOf(task.challenge.id) === -1 && challenge.leader !== user._id && !user.contributor.admin)) { // eslint-disable-line no-extra-parens
        throw new NotFound(res.t('taskNotFound'));
      }
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

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
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty
    // TODO make sure tags are updated correctly (they aren't set as modified!) maybe use specific routes

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
    }).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    Tasks.Task.sanitize(req.body);
    // TODO we have to convert task to an object because otherwise things don't get merged correctly. Bad for performances?
    // TODO regarding comment above, make sure other models with nested fields are using this trick too
    _.assign(task, common.ops.updateTask(task.toObject(), req));
    // TODO console.log(task.modifiedPaths(), task.toObject().repeat === tep)
    // repeat is always among modifiedPaths because mongoose changes the other of the keys when using .toObject()
    // see https://github.com/Automattic/mongoose/issues/2749

    let savedTask = await task.save();
    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask); // TODO catch/log
  },
};

function _generateWebhookTaskData (task, direction, delta, stats, user) {
  let extendedStats = _.extend(stats, {
    toNextLevel: common.tnl(user.stats.lvl),
    maxHealth: common.maxHealth,
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

    let delta = common.ops.scoreTask({task, user, direction}, req);
    // Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
    if (direction === 'up') user.fns.randomDrop({task, delta}, req);

    // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
    // TODO move to common code?
    if (task.type === 'todo') {
      if (!wasCompleted && task.completed) {
        removeFromArray(user.tasksOrder.todos, task._id);
      } else if (wasCompleted && !task.completed) {
        let hasTask = removeFromArray(user.tasksOrder.todos, task._id);
        if (!hasTask) {
          user.tasksOrder.todos.push(task._id); // TODO push at the top?
        } // If for some reason it hadn't been removed previously don't do anything TODO ok?
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

        await chalTask.scoreChallengeTask(delta);
      } catch (e) {
        // TODO handle
      }
    }
  },
};

// completed todos cannot be moved, they'll be returned ordered by date of completion
// TODO check that it works when a tag is selected or todos are split between dated and due
// TODO support challenges?
/**
 * @api {post} /tasks/:taskId/move/to/:position Move a task to a new position
 * @apiVersion 3.0.0
 * @apiName MoveTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 * @apiParam {Number} position Where to move the task (-1 means push to bottom). First position is 0
 *
 * @apiSuccess {object} tasksOrder The new tasks order (user.tasksOrder.{task.type}s)
 */
api.moveTask = {
  method: 'POST',
  url: '/tasks/:taskId/move/to/:position',
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
    if (task.type === 'todo' && task.completed) throw new BadRequest(res.t('cantMoveCompletedTodo'));
    let order = user.tasksOrder[`${task.type}s`];
    let currentIndex = order.indexOf(task._id);

    // If for some reason the task isn't ordered (should never happen), push it in the new position
    // if the task is moved to a non existing position
    // or if the task is moved to position -1 (push to bottom)
    // -> push task at end of list
    if (!order[to] && to !== -1) {
      order.push(task._id);
    } else {
      if (currentIndex !== -1) order.splice(currentIndex, 1);
      if (to === -1) {
        order.push(task._id);
      } else {
        order.splice(to, 0, task._id);
      }
    }

    await user.save();
    res.respond(200, order);
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
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    // TODO check that req.body isn't empty and is an array

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
    }).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    task.checklist.push(Tasks.Task.sanitizeChecklist(req.body)); // TODO why not allow to supply _id on creation?
    let savedTask = await task.save();

    res.respond(200, savedTask); // TODO what to return
    if (challenge) challenge.updateTask(savedTask);
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
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
    }).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let item = _.find(task.checklist, {_id: req.params.itemId});
    if (!item) throw new NotFound(res.t('checklistItemNotFound'));

    _.merge(item, Tasks.Task.sanitizeChecklist(req.body));
    let savedTask = await task.save();

    res.respond(200, savedTask); // TODO what to return
    if (challenge) challenge.updateTask(savedTask);
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
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let task = await Tasks.Task.findOne({
      _id: req.params.taskId,
    }).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let hasItem = removeFromArray(task.checklist, { _id: req.params.itemId });
    if (!hasItem) throw new NotFound(res.t('checklistItemNotFound'));

    let savedTask = await task.save();
    res.respond(200, {}); // TODO what to return
    if (challenge) challenge.updateTask(savedTask);
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

    let hasTag = removeFromArray(task.tags, req.params.tagId);
    if (!hasTag) throw new NotFound(res.t('tagNotFound'));

    await task.save();
    res.respond(200, {}); // TODO what to return
  },
};

// TODO this method needs some limitation, like to check if the challenge is really broken?
/**
 * @api {post} /tasks/unlink/:taskId Unlink a challenge task
 * @apiVersion 3.0.0
 * @apiName UnlinkTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The task _id
 *
 * @apiSuccess {object} empty An empty object
 */
api.unlinkTask = {
  method: 'POST',
  url: '/tasks/unlink/:taskId',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkQuery('keep', res.t('keepOrRemove')).notEmpty().isIn(['keep', 'remove']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let keep = req.query.keep;
    let taskId = req.params.taskId;

    let task = await Tasks.Task.findOne({
      _id: taskId,
      userId: user._id,
    }).exec();

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (!task.challenge.id) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));

    if (keep === 'keep') {
      task.challenge = {};
      await task.save();
    } else { // remove
      if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
        removeFromArray(user.tasksOrder[`${task.type}s`], taskId);
        await Q.all([user.save(), task.remove()]);
      } else {
        await task.remove();
      }
    }

    res.respond(200, {}); // TODO what to return
  },
};

/**
 * @api {post} /tasks/clearCompletedTodos Delete user's completed todos
 * @apiVersion 3.0.0
 * @apiName ClearCompletedTodos
 * @apiGroup Task
 *
 * @apiSuccess {object} empty An empty object
 */
api.clearCompletedTodos = {
  method: 'POST',
  url: '/tasks/clearCompletedTodos',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    // Clear completed todos
    // Do not delete challenges completed todos unless the task is broken
    await Tasks.Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      $or: [
        {'challenge.id': {$exists: false}},
        {'challenge.broken': {$exists: true}},
      ],
    }).exec();

    res.respond(200, {});
  },
};

/**
 * @api {delete} /tasks/:taskId Delete a task given its id
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
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findById(taskId).exec();

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (!task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by an user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.userId && task.challenge.id && !task.challenge.broken) {
      throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));
    }

    if (task.type !== 'todo' || !task.completed) {
      removeFromArray((challenge || user).tasksOrder[`${task.type}s`], taskId);
      await Q.all([(challenge || user).save(), task.remove()]);
    } else {
      await task.remove();
    }

    res.respond(200, {});
    if (challenge) challenge.removeTask(task);
  },
};

module.exports = api;
