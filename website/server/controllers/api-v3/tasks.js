import { authWithHeaders } from '../../middlewares/auth';
import {
  taskActivityWebhook,
  taskScoredWebhook,
} from '../../libs/webhook';
import { removeFromArray } from '../../libs/collectionManipulators';
import * as Tasks from '../../models/task';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';
import {
  createTasks,
  getTasks,
} from '../../libs/taskManager';
import common from '../../../common';
import Bluebird from 'bluebird';
import _ from 'lodash';
import logger from '../../libs/logger';

/**
 * @apiDefine TaskNotFound
 * @apiError (404) {NotFound} TaskNotFound The specified task could not be found.
 */

/**
 * @apiDefine ChecklistNotFound
 * @apiError (404) {NotFound} ChecklistNotFound The specified checklist item could not be found.
 */

let api = {};
let requiredGroupFields = '_id leader tasksOrder name';

/**
 * @api {post} /api/v3/tasks/user Create a new task belonging to the user
 * @apiDescription Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiName CreateUserTasks
 * @apiGroup Task
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.createUserTasks = {
  method: 'POST',
  url: '/tasks/user',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let tasks = await createTasks(req, res, {user});

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    tasks.forEach((task) => {
      taskActivityWebhook.send(user.webhooks, {
        type: 'created',
        task,
      });
    });
  },
};

/**
 * @api {post} /api/v3/tasks/challenge/:challengeId Create a new task belonging to a challenge
 * @apiDescription Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiName CreateChallengeTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} challengeId The id of the challenge the new task(s) will belong to
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 *
 * @apiUse ChallengeNotFound
 */
api.createChallengeTasks = {
  method: 'POST',
  url: '/tasks/challenge/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;

    let challenge = await Challenge.findOne({_id: challengeId}).exec();

    // If the challenge does not exist, or if it exists but user is not the leader -> throw error
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));

    let tasks = await createTasks(req, res, {user, challenge});

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    // If adding tasks to a challenge -> sync users
    if (challenge) challenge.addTasks(tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/user Get a user's tasks
 * @apiName GetUserTasks
 * @apiGroup Task
 *
 * @apiParam {string="habits","dailys","todos","rewards","completedTodos"} type Optional query parameter to return just a type of tasks. By default all types will be returned except completed todos that must be requested separately. The "completedTodos" type returns only the 30 most recently completed.
 *
 * @apiSuccess {Array} data An array of tasks
 */
api.getUserTasks = {
  method: 'GET',
  url: '/tasks/user',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let types = Tasks.tasksTypes.map(type => `${type}s`);
    types.push('completedTodos', '_allCompletedTodos'); // _allCompletedTodos is currently in BETA and is likely to be removed in future
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(types);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;

    let tasks = await getTasks(req, res, {user});
    return res.respond(200, tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/challenge/:challengeId Get a challenge's tasks
 * @apiName GetChallengeTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} challengeId The id of the challenge from which to retrieve the tasks
 * @apiParam {string="habits","dailys","todos","rewards"} type Optional query parameter to return just a type of tasks
 *
 * @apiSuccess {Array} data An array of tasks
 *
 * @apiUse ChallengeNotFound
 */
api.getChallengeTasks = {
  method: 'GET',
  url: '/tasks/challenge/:challengeId',
  middlewares: [authWithHeaders()],
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

    let tasks = await getTasks(req, res, {user, challenge});
    return res.respond(200, tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/:taskId Get a task
 * @apiName GetTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 *
 * @apiSuccess {Object} data The task object
 *
 * @apiUse TaskNotFound
 */
api.getTask = {
  method: 'GET',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      let challenge = await Challenge.find({_id: task.challenge.id}).select('leader').exec();
      if (!challenge || (user.challenges.indexOf(task.challenge.id) === -1 && challenge.leader !== user._id && !user.contributor.admin)) { // eslint-disable-line no-extra-parens
        throw new NotFound(res.t('taskNotFound'));
      }
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    res.respond(200, task);
  },
};

/**
 * @api {put} /api/v3/tasks/:taskId Update a task
 * @apiName UpdateTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse ChallengeNotFound
 */
api.updateTask = {
  method: 'PUT',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let challenge;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);
    let group;

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.group.id && !task.userId) {
      //  @TODO: Abstract this access snippet
      group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    // we have to convert task to an object because otherwise things don't get merged correctly. Bad for performances?
    let [updatedTaskObj] = common.ops.updateTask(task.toObject(), req);

    // Sanitize differently user tasks linked to a challenge
    let sanitizedObj;

    if (!challenge && task.userId && task.challenge && task.challenge.id) {
      sanitizedObj = Tasks.Task.sanitizeUserChallengeTask(updatedTaskObj);
    } else {
      sanitizedObj = Tasks.Task.sanitize(updatedTaskObj);
    }

    _.assign(task, sanitizedObj);
    // console.log(task.modifiedPaths(), task.toObject().repeat === tep)
    // repeat is always among modifiedPaths because mongoose changes the other of the keys when using .toObject()
    // see https://github.com/Automattic/mongoose/issues/2749

    let savedTask = await task.save();

    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask);
    }

    res.respond(200, savedTask);

    if (challenge) {
      challenge.updateTask(savedTask);
    } else if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask);
    } else {
      taskActivityWebhook.send(user.webhooks, {
        type: 'updated',
        task: savedTask,
      });
    }
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/score/:direction Score a task
 * @apiName ScoreTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {String="up","down"} direction The direction for scoring the task
 *
 * @apiSuccess {Object} data._tmp If an item was dropped it'll be returned in te _tmp object
 * @apiSuccess {Number} data.delta The delta
 * @apiSuccess {Object} data The user stats
 *
 * @apiUse TaskNotFound
 */
api.scoreTask = {
  method: 'POST',
  url: '/tasks/:taskId/score/:direction',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('direction', res.t('directionUpDown')).notEmpty().isIn(['up', 'down']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let {taskId} = req.params;

    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, {userId: user._id});
    let direction = req.params.direction;

    if (!task) throw new NotFound(res.t('taskNotFound'));

    let wasCompleted = task.completed;

    let [delta] = common.ops.scoreTask({task, user, direction}, req);
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
          user.tasksOrder.todos.push(task._id);
        } // If for some reason it hadn't been removed previously don't do anything
      }
    }

    let results = await Bluebird.all([
      user.save(),
      task.save(),
    ]);

    let savedUser = results[0];

    let userStats = savedUser.stats.toJSON();
    let resJsonData = _.extend({delta, _tmp: user._tmp}, userStats);
    res.respond(200, resJsonData);

    taskScoredWebhook.send(user.webhooks, {
      task,
      direction,
      delta,
      user,
    });

    if (task.challenge && task.challenge.id && task.challenge.taskId && !task.challenge.broken && task.type !== 'reward') {
      // Wrapping everything in a try/catch block because if an error occurs using `await` it MUST NOT bubble up because the request has already been handled
      try {
        let chalTask = await Tasks.Task.findOne({
          _id: task.challenge.taskId,
        }).exec();

        if (!chalTask) return;

        await chalTask.scoreChallengeTask(delta);
      } catch (e) {
        logger.error(e);
      }
    }

    /*
     * TODO: enable score task analytics if desired
    res.analytics.track('score task', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      taskType: task.type,
      direction
    });
    */
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/move/to/:position Move a task to a new position
 * @apiDescription Note: completed To-Dos are not sortable, do not appear in user.tasksOrder.todos, and are ordered by date of completion.
 * @apiName MoveTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {Number} position Query parameter - Where to move the task (-1 means push to bottom). First position is 0
 *
 * @apiSuccess {Array} data The new tasks order (user.tasksOrder.{task.type}s)
 *
 * @apiUse TaskNotFound
 */
api.moveTask = {
  method: 'POST',
  url: '/tasks/:taskId/move/to/:position',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let taskId = req.params.taskId;
    let to = Number(req.params.position);

    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

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
 * @api {post} /api/v3/tasks/:taskId/checklist Add an item to the task's checklist
 * @apiName AddChecklistItem
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse ChallengeNotFound
 */
api.addChecklistItem = {
  method: 'POST',
  url: '/tasks/:taskId/checklist',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let challenge;
    let group;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.group.id && !task.userId) {
      group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    task.checklist.push(Tasks.Task.sanitizeChecklist(req.body));
    let savedTask = await task.save();

    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask);
    }
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/checklist/:itemId/score Score a checklist item
 * @apiName ScoreChecklistItem
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse ChecklistNotFound
 */
api.scoreCheckListItem = {
  method: 'POST',
  url: '/tasks/:taskId/checklist/:itemId/score',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let item = _.find(task.checklist, {id: req.params.itemId});

    if (!item) throw new NotFound(res.t('checklistItemNotFound'));
    item.completed = !item.completed;
    let savedTask = await task.save();

    res.respond(200, savedTask);
  },
};

/**
 * @api {put} /api/v3/tasks/:taskId/checklist/:itemId Update a checklist item
 * @apiName UpdateChecklistItem
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse ChecklistNotFound
 * @apiUse ChallengeNotFound
 */
api.updateChecklistItem = {
  method: 'PUT',
  url: '/tasks/:taskId/checklist/:itemId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let challenge;
    let group;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.group.id && !task.userId) {
      group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let item = _.find(task.checklist, {id: req.params.itemId});
    if (!item) throw new NotFound(res.t('checklistItemNotFound'));

    _.merge(item, Tasks.Task.sanitizeChecklist(req.body));
    let savedTask = await task.save();

    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask);
    }
  },
};

/**
 * @api {delete} /api/v3/tasks/:taskId/checklist/:itemId Remove a checklist item
 * @apiName RemoveChecklistItem
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {UUID} itemId The checklist item _id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse ChallengeNotFound
 * @apiUse ChecklistNotFound
 */
api.removeChecklistItem = {
  method: 'DELETE',
  url: '/tasks/:taskId/checklist/:itemId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let challenge;
    let group;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.group.id && !task.userId) {
      group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let hasItem = removeFromArray(task.checklist, { id: req.params.itemId });
    if (!hasItem) throw new NotFound(res.t('checklistItemNotFound'));

    let savedTask = await task.save();
    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask);
    }
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/tags/:tagId Add a tag to a task
 * @apiName AddTagToTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {UUID} tagId The tag id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 */
api.addTagToTask = {
  method: 'POST',
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    let userTags = user.tags.map(tag => tag.id);
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID().isIn(userTags);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('taskNotFound'));
    let tagId = req.params.tagId;

    let alreadyTagged = task.tags.indexOf(tagId) !== -1;
    if (alreadyTagged) throw new BadRequest(res.t('alreadyTagged'));

    task.tags.push(tagId);

    let savedTask = await task.save();
    res.respond(200, savedTask);
  },
};

/**
 * @api {delete} /api/v3/tasks/:taskId/tags/:tagId Remove a tag from a task
 * @apiName RemoveTagFromTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {UUID} tagId The tag id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
 * @apiUse TagNotFound
 */
api.removeTagFromTask = {
  method: 'DELETE',
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty();
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('taskNotFound'));

    let hasTag = removeFromArray(task.tags, req.params.tagId);
    if (!hasTag) throw new NotFound(res.t('tagNotFound'));

    let savedTask = await task.save();
    res.respond(200, savedTask);
  },
};

/**
 * @api {post} /api/v3/tasks/unlink-all/:challengeId Unlink all tasks from a challenge
 * @apiName UnlinkAllTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} challengeId The challenge _id
 * @apiParam {String} keep Query parameter - keep-all or remove-all
 *
 * @apiSuccess {Object} data An empty object
 */
api.unlinkAllTasks = {
  method: 'POST',
  url: '/tasks/unlink-all/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkQuery('keep', res.t('keepOrRemoveAll')).notEmpty().isIn(['keep-all', 'remove-all']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let keep = req.query.keep;
    let challengeId = req.params.challengeId;

    let tasks = await Tasks.Task.find({
      'challenge.id': challengeId,
      userId: user._id,
    }).exec();

    let validTasks = tasks.every(task => {
      return task.challenge.broken;
    });

    if (!validTasks) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));

    if (keep === 'keep-all') {
      await Bluebird.all(tasks.map(task => {
        task.challenge = {};
        return task.save();
      }));
    } else { // remove
      let toSave = [];

      tasks.forEach(task => {
        if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
          removeFromArray(user.tasksOrder[`${task.type}s`], task._id);
        }

        toSave.push(task.remove());
      });

      toSave.push(user.save());

      await Bluebird.all(toSave);
    }

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/tasks/unlink-one/:taskId Unlink a challenge task
 * @apiName UnlinkOneTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 * @apiParam {String} keep Query parameter - keep or remove
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TaskNotFound
 */
api.unlinkOneTask = {
  method: 'POST',
  url: '/tasks/unlink-one/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkQuery('keep', res.t('keepOrRemove')).notEmpty().isIn(['keep', 'remove']);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let keep = req.query.keep;
    let taskId = req.params.taskId;

    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('taskNotFound'));
    if (!task.challenge.id) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));
    if (!task.challenge.broken) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));

    if (keep === 'keep') {
      task.challenge = {};
      await task.save();
    } else { // remove
      if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
        removeFromArray(user.tasksOrder[`${task.type}s`], taskId);
        await Bluebird.all([user.save(), task.remove()]);
      } else {
        await task.remove();
      }
    }

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/tasks/clearCompletedTodos Delete user's completed todos
 * @apiName ClearCompletedTodos
 * @apiGroup Task
 *
 * @apiSuccess {Object} data An empty object
 */
api.clearCompletedTodos = {
  method: 'POST',
  url: '/tasks/clearCompletedTodos',
  middlewares: [authWithHeaders()],
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
 * @api {delete} /api/v3/tasks/:taskId Delete a task given its id
 * @apiName DeleteTask
 * @apiGroup Task
 *
 * @apiParam {String} taskId The task _id or alias
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TaskNotFound
 * @apiUse ChallengeNotFound
 */
api.deleteTask = {
  method: 'DELETE',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let challenge;

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.group.id && !task.userId) {
      //  @TODO: Abstract this access snippet
      let group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
      await group.removeTask(task);
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.userId && task.challenge.id && !task.challenge.broken) {
      throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));
    }

    if (task.type !== 'todo' || !task.completed) {
      removeFromArray((challenge || user).tasksOrder[`${task.type}s`], taskId);
      await Bluebird.all([(challenge || user).save(), task.remove()]);
    } else {
      await task.remove();
    }

    res.respond(200, {});

    if (challenge) {
      challenge.removeTask(task);
    } else {
      taskActivityWebhook.send(user.webhooks, {
        type: 'deleted',
        task,
      });
    }
  },
};

module.exports = api;
