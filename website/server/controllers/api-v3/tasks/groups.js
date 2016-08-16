import { authWithHeaders } from '../../../middlewares/auth';
import * as Tasks from '../../../models/task';
import { model as Group } from '../../../models/group';
import {
  NotFound,
  NotAuthorized,
} from '../../../libs/errors';
import {
  createTasks,
  getTasks,
} from '../../../libs/taskManager';

let api = {};

/**
 * @api {post} /api/v3/tasks/group/:groupId Create a new task belonging to a group
 * @apiDescription Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiVersion 3.0.0
 * @apiName CreateGroupTasks
 * @apiGroup Task
 * @apiIgnore
 *
 * @apiParam {UUID} groupId The id of the group the new task(s) will belong to
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.createGroupTasks = {
  method: 'POST',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;

    let group = await Group.getGroup({user, groupId: req.params.groupId, populateLeader: false});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    let tasks = await createTasks(req, res, {user, undefined, group});

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    return null;
  },
};

/**
 * @api {get} /api/v3/tasks/group/:groupId Get a group's tasks
 * @apiVersion 3.0.0
 * @apiName GetGroupTasks
 * @apiGroup Task
 * @apiIgnore
 *
 * @apiParam {UUID} groupId The id of the group from which to retrieve the tasks
 * @apiParam {string="habits","dailys","todos","rewards"} type Optional query parameter to return just a type of tasks
 *
 * @apiSuccess {Array} data An array of tasks
 */
api.getGroupTasks = {
  method: 'GET',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();
    let types = Tasks.tasksTypes.map(type => `${type}s`);
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(types);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;

    let group = await Group.getGroup({user, groupId: req.params.groupId, populateLeader: false});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let tasks = await getTasks(req, res, {user, undefined, group});
    res.respond(200, tasks);
  },
};

module.exports = api;
