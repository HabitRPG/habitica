import { authWithHeaders } from '../../middlewares/auth';
import {
  taskActivityWebhook,
  taskScoredWebhook,
} from '../../libs/webhook';
import { removeFromArray } from '../../libs/collectionManipulators';
import * as Tasks from '../../models/task';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../../libs/errors';
import {
  createTasks,
  getTasks,
  moveTask,
  setNextDue,
} from '../../libs/taskManager';
import common from '../../../common';
import Bluebird from 'bluebird';
import _ from 'lodash';
import logger from '../../libs/logger';

const MAX_SCORE_NOTES_LENGTH = 256;

function canNotEditTasks (group, user, assignedUserId) {
  let isNotGroupLeader = group.leader !== user._id;
  let isManager = Boolean(group.managers[user._id]);
  let userIsAssigningToSelf = Boolean(assignedUserId && user._id === assignedUserId);
  return isNotGroupLeader && !isManager && !userIsAssigningToSelf;
}

/**
 * @apiDefine TaskNotFound
 * @apiError (404) {NotFound} TaskNotFound The specified task could not be found.
 */

/**
 * @apiDefine ChecklistNotFound
 * @apiError (404) {NotFound} ChecklistNotFound The specified checklist item could not be found.
 */

/**
 * @apiDefine NotAuthorized
 * @apiError (401) {NotAuthorized} There is no account that uses those credentials.
 */

let api = {};
let requiredGroupFields = '_id leader tasksOrder name';

/**
 * @api {post} /api/v3/tasks/user Create a new task belonging to the user
 * @apiDescription Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiName CreateUserTasks
 * @apiGroup Task
 *
 * @apiParam (Body) {String} text The text to be displayed for the task
 * @apiParam (Body) {String="habit","daily","todo","reward"} type Task type, options are: "habit", "daily", "todo", "reward".
 * @apiParam (Body) {String[]} [tags] Array of UUIDs of tags
 * @apiParam (Body) {String} [alias] Alias to assign to task
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use, options are: "str", "int", "per", "con"
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {String} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1, 1.5, 2; eqivalent of Trivial, Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must include: a UUID, startDate and time. For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3","startDate":"1/16/17","time":"1/16/17" }
 * @apiParam (Body) {String="weekly","daily"} [frequency=weekly] Value "weekly" enables "On days of the week", value "daily" enables "EveryX Days". Only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,  Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily", the number of days until this daily task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively been checked off. Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available. Only valid for type "daily"
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits"
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits"
 * @apiParam (Body) {Number} [value=0] Only valid for type "reward." The cost in gold of the reward
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "text":"Update Habitica API Documentation - Tasks",
 *       "type":"todo",
 *       "alias":"hab-api-tasks",
 *       "notes":"Update the tasks api on GitHub",
 *       "tags":["ed427623-9a69-4aac-9852-13deb9c190c3"],
 *       "priority":2
 *     }
 *
 * @apiSuccess (201) data An object if a single task was created, otherwise an array of tasks
 *
 * @apiSuccessExample {json} Success-Response:
 *     {
 *       "success": true,
 *       "data": {
 *         "userId": "b0413351-405f-416f-8787-947ec1c85199",
 *         "alias": "hab-api-tasks",
 *         "text": "Update Habitica API Documentation - Tasks",
 *         "type": "todo",
 *         "notes": "Update the tasks api on GitHub",
 *         "tags": [
 *           "ed427623-9a69-4aac-9852-13deb9c190c3"
 *         ],
 *         "value": 0,
 *         "priority": 2,
 *         "attribute": "str",
 *         "challenge": {
 *
 *         },
 *         "group": {
 *           "assignedUsers": [
 *
 *           ],
 *           "approval": {
 *             "required": false,
 *             "approved": false,
 *             "requested": false
 *           }
 *         },
 *         "reminders": [
 *
 *         ],
 *         "_id": "829d435b-edc4-498c-a30e-e52361a0f35a",
 *         "createdAt": "2017-01-12T02:11:02.876Z",
 *         "updatedAt": "2017-01-12T02:11:02.876Z",
 *         "checklist": [
 *
 *         ],
 *         "collapseChecklist": false,
 *         "completed": false,
 *         "id": "829d435b-edc4-498c-a30e-e52361a0f35a"
 *       },
 *       "notifications": [
 *
 *       ]
 *     }
 *
 * @apiError (404) {NotFound} ChecklistNotFound The specified checklist item could not be found.
 * @apiError (400) {BadRequest} MustBeType Task type must be one of "habit", "daily", "todo", "reward".
 * @apiError (400) {BadRequest} Text-ValidationFailed Path 'text' is required.
 * @apiError (400) {BadRequest} Alias-ValidationFailed Task short names can only contain alphanumeric characters, underscores and dashes.
 * @apiError (400) {BadRequest} Value-ValidationFailed `x` is not a valid enum value for path `(body param)`.
 * @apiError (401) {NotAuthorized} There is no account that uses those credentials.
 *
 * @apiErrorExample {json} Error-Response:
 *     {
 *       "success": false,
 *       "error": "BadRequest",
 *       "message": "todo validation failed",
 *       "errors": [
 *           {
 *             "message": "Path `text` is required.",
 *             "path": "text"
 *           }
 *         ]
 *       }
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
 * @apiParam (Path) {UUID} challengeId The id of the challenge the new task(s) will belong to
 *
 * @apiParam (Body) {String} text The text to be displayed for the task
 * @apiParam (Body) {String="habit","daily","todo","reward"} type Task type, options are: "habit", "daily", "todo", "reward".
 * @apiParam (Body) {String} [alias] Alias to assign to task
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use, options are: "str", "int", "per", "con"
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {String} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1, 1.5, 2; eqivalent of Trivial, Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must include: a UUID, startDate and time. For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3","startDate":"1/16/17","time":"1/16/17" }
 * @apiParam (Body) {String="weekly","daily"} [frequency=weekly] Value "weekly" enables "On days of the week", value "daily" enables "EveryX Days". Only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,  Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily", the number of days until this daily task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively been checked off. Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available. Only valid for type "daily"
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits"
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits"
 * @apiParam (Body) {Number} [value=0] Only valid for type "reward." The cost in gold of the reward
 *
 * @apiParamExample {json} Request-Example:
 * {"type":"todo","text":"Test API Params"}
 *
 * @apiSuccess (201) data An object if a single task was created, otherwise an array of tasks
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"text":"Test API Params","type":"todo","notes":"","tags":[],"value":0,"priority":1,"attribute":"str","challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"_id":"4a29874c-0308-417b-a909-2a7d262b49f6","createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-13T21:23:05.949Z","checklist":[],"collapseChecklist":false,"completed":false,"id":"4a29874c-0308-417b-a909-2a7d262b49f6"},"notifications":[]}
 *
 * @apiError (404) {NotFound} ChecklistNotFound The specified checklist item could not be found.
 * @apiUse ChallengeNotFound
 * @apiError (400) {BadRequest} MustBeType Task type must be one of "habit", "daily", "todo", "reward".
 * @apiError (400) {BadRequest} Text-ValidationFailed Path 'text' is required.
 * @apiError (400) {BadRequest} Alias-ValidationFailed Task short names can only contain alphanumeric characters, underscores and dashes.
 * @apiError (400) {BadRequest} Value-ValidationFailed `x` is not a valid enum value for path `(body param)`.
 * @apiError (401) {NotAuthorized} There is no account that uses those credentials.
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
 * @apiParam (Query) {String="habits","dailys","todos","rewards","completedTodos"} type Optional query parameter to return just a type of tasks. By default all types will be returned except completed todos that must be requested separately. The "completedTodos" type returns only the 30 most recently completed.
 *
 * @apiSuccess {Array} data An array of tasks
 *
 * @apiSuccessExample
 * {"success":true,"data":[{"_id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"15 minute break","type":"reward","notes":"","tags":[],"value":10,"priority":1,"attribute":"str","challenge":{},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-07T17:52:09.121Z","updatedAt":"2017-01-11T14:25:32.504Z","id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3"},,{"_id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3","userId":"b0413351-405f-416f-8787-947ec1c85199","alias":"prac31","text":"Practice Task 31","type":"daily","notes":"","tags":[],"value":1,"priority":1,"attribute":"str","challenge":{},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[{"time":"2017-01-13T16:21:00.074Z","startDate":"2017-01-13T16:20:00.074Z","id":"b8b549c4-8d56-4e49-9b38-b4dcde9763b9"}],"createdAt":"2017-01-13T16:34:06.632Z","updatedAt":"2017-01-13T16:49:35.762Z","checklist":[],"collapseChecklist":false,"completed":true,"history":[],"streak":1,"repeat":{"su":false,"s":false,"f":true,"th":true,"w":true,"t":true,"m":true},"startDate":"2017-01-13T00:00:00.000Z","everyX":1,"frequency":"weekly","id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3"}],"notifications":[]}
 *
 * @apiError (BadRequest) Invalid_request_parameters Error returned if the type URL param was not correct.
 * @apiError (401) {NotAuthorized} There is no account that uses those credentials.
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
    let dueDate = req.query.dueDate;

    let tasks = await getTasks(req, res, {user, dueDate});
    return res.respond(200, tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/challenge/:challengeId Get a challenge's tasks
 * @apiName GetChallengeTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} challengeId The id of the challenge from which to retrieve the tasks
 * @apiParam (Query) {String="habits","dailys","todos","rewards"} [type] Query parameter to return just a type of tasks
 *
 * @apiExample {curl} Example use:
 * curl -i https://habitica.com/api/v3/tasks/challenge/f23c12f2-5830-4f15-9c36-e17fd729a812
 *
 * @apiSuccess {Array} data An array of tasks
 *
 * @apiSuccessExample
 * {"success":true,"data":[{"_id":"5f12bfba-da30-4733-ad01-9c42f9817975","text":"API Trial","type":"habit","notes":"","tags":[],"value":27.70767809690112,"priority":1.5,"attribute":"str","challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-12T19:03:33.485Z","updatedAt":"2017-01-13T17:45:52.442Z","history":[{"date":1484257319183,"value":18.53316748293123},{"date":1484329552441,"value":27.70767809690112}],"down":false,"up":true,"id":"5f12bfba-da30-4733-ad01-9c42f9817975"},{"_id":"54a81d23-529c-4daa-a6f7-c5c6e7e84936","text":"Challenge TODO","type":"todo","notes":"","tags":[],"value":2,"priority":2,"attribute":"str","challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-12T19:07:10.310Z","updatedAt":"2017-01-13T20:24:51.070Z","checklist":[],"collapseChecklist":false,"completed":false,"id":"54a81d23-529c-4daa-a6f7-c5c6e7e84936"}],"notifications":[]}
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

    let challenge = await Challenge.findOne({
      _id: challengeId,
    }).select('group leader tasksOrder').exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    let group = await Group.getGroup({
      user,
      groupId: challenge.group,
      fields: '_id type privacy',
      optionalMembership: true,
    });
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
 * @apiParam (Path) {String} taskId The task _id or alias
 *
 * @apiExample {curl} Example use:
 * curl -i https://habitica.com/api/v3/tasks/54a81d23-529c-4daa-a6f7-c5c6e7e84936
 *
 * @apiSuccess {Object} data The task object
 *
 * @apiSuccessExample {json} Example returned object
 * {"success":true,"data":{"_id":"2b774d70-ec8b-41c1-8967-eb6b13d962ba","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"API Trial","alias":"apiTrial","type":"habit","notes":"","tags":[],"value":11.996661122825959,"priority":1.5,"attribute":"str","challenge":{"taskId":"5f12bfba-da30-4733-ad01-9c42f9817975","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-12T19:03:33.495Z","updatedAt":"2017-01-13T20:52:02.927Z","history":[{"value":1,"date":1484248053486},{"value":1.9747,"date":1484252965224},{"value":2.9253562257358428,"date":1484252966902},{"value":3.853133245658556,"date":1484257191129},{"value":4.759112700885761,"date":1484257318911},{"value":5.6443010177121415,"date":1484257319164},{"value":3.752384470969301,"date":1484311429292},{"value":4.660705953838478,"date":1484311575632},{"value":5.54812929062314,"date":1484315395369},{"value":6.415599723011605,"date":1484329050485},{"value":7.263999553295137,"date":1484329050885},{"value":8.094153625212375,"date":1484329051509},{"value":8.906834219714574,"date":1484329088943},{"value":9.70276543915464,"date":1484329089547},{"value":10.482627142836241,"date":1484329089835},{"value":11.24705848799571,"date":1484329095500},{"value":11.996661122825959,"date":1484329552423}],"down":false,"up":true,"id":"2b774d70-ec8b-41c1-8967-eb6b13d962ba"},"notifications":[]}
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
 * @apiParam (Path) {String} taskId The task _id or alias
 *
 * @apiParam (Body) {String} [text] The text to be displayed for the task
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use, options are: "str", "int", "per", "con"
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {String} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1, 1.5, 2; eqivalent of Trivial, Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must include: a UUID, startDate and time.
 * @apiParam (Body) {String="weekly","daily"} [frequency=weekly] Value "weekly" enables "On days of the week", value "daily" enables "EveryX Days". Only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,  Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily", the number of days until this daily task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively been checked off. Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available. Only valid for type "daily"
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits"
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits"
 * @apiParam (Body) {Number} [value=0] Only valid for type "reward." The cost in gold of the reward
 *
 * @apiParamExample {json} Request-Example:
 * {"notes":"This will be replace the notes, anything not specified will remain the same"}
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiUse TaskNotFound
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
      let fields = requiredGroupFields.concat(' managers');
      group = await Group.getGroup({user, groupId: task.group.id, fields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    let oldCheckList = task.checklist;
    // we have to convert task to an object because otherwise things don't get merged correctly. Bad for performances?
    let [updatedTaskObj] = common.ops.updateTask(task.toObject(), req);

    // Sanitize differently user tasks linked to a challenge
    let sanitizedObj;

    if (!challenge && task.userId && task.challenge && task.challenge.id) {
      sanitizedObj = Tasks.Task.sanitizeUserChallengeTask(updatedTaskObj);
    } else if (!group && task.userId && task.group && task.group.id) {
      sanitizedObj = Tasks.Task.sanitizeUserChallengeTask(updatedTaskObj);
    } else {
      sanitizedObj = Tasks.Task.sanitize(updatedTaskObj);
    }

    _.assign(task, sanitizedObj);
    // console.log(task.modifiedPaths(), task.toObject().repeat === tep)
    // repeat is always among modifiedPaths because mongoose changes the other of the keys when using .toObject()
    // see https://github.com/Automattic/mongoose/issues/2749

    task.group.approval.required = false;
    if (sanitizedObj.requiresApproval) {
      task.group.approval.required = true;
    }

    setNextDue(task, user);

    let savedTask = await task.save();

    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      let updateCheckListItems = _.remove(sanitizedObj.checklist, function getCheckListsToUpdate (checklist) {
        let indexOld = _.findIndex(oldCheckList,  function findIndex (check) {
          return check.id === checklist.id;
        });
        if (indexOld !== -1) return checklist.text !== oldCheckList[indexOld].text;
        return false; // Only return changes. Adding and remove are handled differently
      });

      await group.updateTask(savedTask, {updateCheckListItems});
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
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {String="up","down"} direction The direction for scoring the task
 * @apiParam (Body) {String} scoreNotes Notes explaining the scoring
 *
 * @apiExample {json} Example call:
 * curl -X "POST" https://habitica.com/api/v3/tasks/test-api-params/score/up
 *
 * @apiSuccess {Object} data The user stats
 * @apiSuccess {Object} data._tmp If an item was dropped it'll be returned in te _tmp object
 * @apiSuccess {Number} data.delta The delta
 *
 * @apiSuccessExample {json} Example result:
 * {"success":true,"data":{"delta":0.9746999906450404,"_tmp":{},"hp":49.06645205596985,"mp":37.2008917491047,"exp":101.93810026267543,"gp":77.09694176716997,"lvl":19,"class":"rogue","points":0,"str":5,"con":3,"int":3,"per":8,"buffs":{"str":9,"int":9,"per":9,"con":9,"stealth":0,"streaks":false,"snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},"training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiSuccessExample {json} Example result with item drop:
 * {"success":true,"data":{"delta":1.0259567046270648,"_tmp":{"quest":{"progressDelta":1.2362778290756147,"collection":1},"drop":{"target":"Zombie","article":"","canDrop":true,"value":1,"key":"RottenMeat","type":"Food","dialog":"You've found Rotten Meat! Feed this to a pet and it may grow into a sturdy steed."}},"hp":50,"mp":66.2390716654227,"exp":143.93810026267545,"gp":135.12889840462591,"lvl":20,"class":"rogue","points":0,"str":6,"con":3,"int":3,"per":8,"buffs":{"str":10,"int":10,"per":10,"con":10,"stealth":0,"streaks":false,"snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},"training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
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
    let scoreNotes = req.body.scoreNotes;
    if (scoreNotes && scoreNotes.length > MAX_SCORE_NOTES_LENGTH) throw new NotAuthorized(res.t('taskScoreNotesTooLong'));
    let {taskId} = req.params;

    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id, {userId: user._id});
    let direction = req.params.direction;

    if (scoreNotes) task.scoreNotes = scoreNotes;

    if (!task) throw new NotFound(res.t('taskNotFound'));

    if (task.type === 'daily' || task.type === 'todo') {
      if (task.completed && direction === 'up') {
        throw new NotAuthorized(res.t('sessionOutdated'));
      } else if (!task.completed && direction === 'down') {
        throw new NotAuthorized(res.t('sessionOutdated'));
      }
    }

    if (task.group.approval.required && !task.group.approval.approved) {
      if (task.group.approval.requested) {
        throw new NotAuthorized(res.t('taskRequiresApproval'));
      }

      task.group.approval.requested = true;
      task.group.approval.requestedDate = new Date();

      let fields = requiredGroupFields.concat(' managers');
      let group = await Group.getGroup({user, groupId: task.group.id, fields});

      // @TODO: we can use the User.pushNotification function because we need to ensure notifications are translated
      let managerIds = Object.keys(group.managers);
      managerIds.push(group.leader);
      let managers = await User.find({_id: managerIds}, 'notifications preferences').exec(); // Use this method so we can get access to notifications

      let managerPromises = [];
      managers.forEach((manager) => {
        manager.addNotification('GROUP_TASK_APPROVAL', {
          message: res.t('userHasRequestedTaskApproval', {
            user: user.profile.name,
            taskName: task.text,
          }, manager.preferences.language),
          groupId: group._id,
          taskId: task._id,
          direction,
        });
        managerPromises.push(manager.save());
      });

      managerPromises.push(task.save());
      await Bluebird.all(managerPromises);

      throw new NotAuthorized(res.t('taskApprovalHasBeenRequested'));
    }

    let wasCompleted = task.completed;

    let [delta] = common.ops.scoreTask({task, user, direction}, req);
    // Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
    if (direction === 'up') user.fns.randomDrop({task, delta}, req, res.analytics);

    // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
    // TODO move to common code?
    let taskOrderPromise;
    if (task.type === 'todo') {
      if (!wasCompleted && task.completed) {
        // @TODO: mongoose's push and pull should be atomic and help with
        // our concurrency issues. If not, we need to use this update $pull and $push
        taskOrderPromise = user.update({
          $pull: { 'tasksOrder.todos': task._id },
        }).exec();
        // user.tasksOrder.todos.pull(task._id);
      } else if (wasCompleted && !task.completed && user.tasksOrder.todos.indexOf(task._id) === -1) {
        taskOrderPromise = user.update({
          $push: { 'tasksOrder.todos': task._id },
        }).exec();
        // user.tasksOrder.todos.push(task._id);
      }
    }

    setNextDue(task, user);

    if (user._ABtests && user._ABtests.guildReminder && user._ABtests.counter !== -1) {
      user._ABtests.counter++;
      if (user._ABtests.counter > 1) {
        if (user._ABtests.guildReminder.indexOf('timing1') !== -1 || user._ABtests.counter > 4) {
          user._ABtests.counter = -1;
          let textVariant = user._ABtests.guildReminder.indexOf('text2');
          user.addNotification('GUILD_PROMPT', {textVariant});
        }
      }
      user.markModified('_ABtests');
    }

    let promises = [
      user.save(),
      task.save(),
    ];
    if (taskOrderPromise) promises.push(taskOrderPromise);
    let results = await Bluebird.all(promises);

    let savedUser = results[0];

    let userStats = savedUser.stats.toJSON();
    let resJsonData = _.assign({delta, _tmp: user._tmp}, userStats);
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
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {Number} position Where to move the task. 0 = top of the list. -1 = bottom of the list.  (-1 means push to bottom). First position is 0
 *
 * @apiSuccess {Array} data The new tasks order for the specific type that the taskID belongs to.
 *
 * @apiSuccessExample {json}
 * {"success":true,"data":["8d7e237a-b259-46ee-b431-33621256bb0b","2b774d70-ec8b-41c1-8967-eb6b13d962ba","f03d4a2b-9c36-4f33-9b5f-bae0aed23a49"],"notifications":[]}
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

    // In memory updates
    let order = user.tasksOrder[`${task.type}s`];
    moveTask(order, task._id, to);

    // Server updates
    // @TODO: maybe bulk op?
    let pullQuery = { $pull: {} };
    pullQuery.$pull[`tasksOrder.${task.type}s`] = task.id;
    await user.update(pullQuery).exec();

    // Handle push to bottom
    let position = to;
    if (to === -1) position = [`tasksOrder.${task.type}s`].length - 1;

    let updateQuery = { $push: {} };
    updateQuery.$push[`tasksOrder.${task.type}s`] = {
      $each: [task._id],
      $position: position,
    };
    await user.update(updateQuery).exec();

    res.respond(200, order);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/checklist Add an item to the task's checklist
 * @apiName AddChecklistItem
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 *
 * @apiParam (Body) {String} text The text of the checklist item
 *
 * @apiParamExample {json} Example body data:
 * {"text":"Do this subtask"}
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params","alias":"test-api-params","type":"todo","notes":"","tags":[],"value":0,"priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T03:38:07.406Z","checklist":[{"id":"afe4079d-dff1-47d9-9b06-5d76c69ddb12","text":"Do this subtask","completed":false}],"collapseChecklist":false,"completed":false,"id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
 *
 * @apiUse TaskNotFound
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
      let fields = requiredGroupFields.concat(' managers');
      group = await Group.getGroup({user, groupId: task.group.id, fields});
      if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    }

    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    let newCheckListItem = Tasks.Task.sanitizeChecklist(req.body);
    task.checklist.push(newCheckListItem);
    let savedTask = await task.save();

    newCheckListItem.id = savedTask.checklist[savedTask.checklist.length - 1].id;

    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
    if (group && task.group.id && task.group.assignedUsers.length > 0) {
      await group.updateTask(savedTask, {newCheckListItem});
    }
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/checklist/:itemId/score Score a checklist item
 * @apiName ScoreChecklistItem
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {UUID} itemId The checklist item _id
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
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {UUID} itemId The checklist item _id
 *
 * @apiParam (body) {String} text The text that will replace the current checkitem text.
 *
 * @apiParamExample {json} Example body:
 * {"text":"Czech 1"}
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
      let fields = requiredGroupFields.concat(' managers');
      group = await Group.getGroup({user, groupId: task.group.id, fields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
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
 * @api {delete} /api/v3/tasks/:taskId/checklist/:itemId Delete a checklist item from a task
 * @apiName RemoveChecklistItem
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {UUID} itemId The checklist item _id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params","alias":"test-api-params","type":"todo","notes":"","tags":[],"value":-1,"priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T19:35:41.881Z","checklist":[],"collapseChecklist":false,"completed":false,"id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
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
      let fields = requiredGroupFields.concat(' managers');
      group = await Group.getGroup({user, groupId: task.group.id, fields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
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
      await group.updateTask(savedTask, {removedCheckListItemId: req.params.itemId});
    }
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/tags/:tagId Add a tag to a task
 * @apiName AddTagToTask
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {UUID} tagId The tag id
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params","alias":"test-api-params","type":"todo","notes":"","tags":["3d5d324d-a042-4d5f-872e-0553e228553e"],"value":-1,"priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T19:41:29.466Z","checklist":[],"collapseChecklist":false,"completed":false,"id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
 *
 * @apiUse TaskNotFound
 * @apiError (400) {BadRequest} Invalid-request-parameters "tagId" must be a valid UUID corresponding to a tag belonging to the user.
 * @apiError (400) {BadRequest} TagExists The task is already tagged with given tag.
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
 * @api {delete} /api/v3/tasks/:taskId/tags/:tagId Delete a tag from a task
 * @apiName RemoveTagFromTask
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {UUID} tagId The tag id
 *
 * @apiExample {curl} Example use:
 * curl -X "DELETE" https://habitica.com/api/v3/tasks/test-api-params/tags/3d5d324d-a042-4d5f-872e-0553e228553e
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880","userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params","alias":"test-api-params","type":"todo","notes":"","tags":[],"value":-1,"priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6","id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,"requested":false}},"reminders":[],"createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T20:02:18.206Z","checklist":[],"collapseChecklist":false,"completed":false,"id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
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
 * @apiParam (Path) {UUID} challengeId The challenge _id
 * @apiParam (Query) {String='keep-all','remove-all'} keep Specifies if tasks should be kept(keep-all) or removed(remove-all) after the unlink
 *
 * @apiExample {curl}
 * curl -X "POST" https://habitica.com/api/v3/tasks/unlink-all/f23c12f2-5830-4f15-9c36-e17fd729a812?keep=remove-all
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{},"notifications":[]}
 *
 * @apiError (400) {BadRequest} Broken Only broken challenges tasks can be unlinked.
 *
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
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Query) {String='keep','remove'} keep  Specifies if the task should be kept(keep) or removed(remove)
 *
 * @apiExample {curl} Example call:
 * curl -X "POST" https://habitica.com/api/v3/tasks/unlink-one/ee882e1d-ebd1-4716-88f2-4f9e47d947a8?keep=keep
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TaskNotFound
 * @apiError (400) {BadRequest} Broken Only broken challenges tasks can be unlinked.
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
 * @apiExample {curl} Example call:
 * curl -X "POST" https://habitica.com/api/v3/tasks/ClearCompletedTodos
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{},"notifications":[]}
 */
api.clearCompletedTodos = {
  method: 'POST',
  url: '/tasks/clearCompletedTodos',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    // Clear completed todos
    // Do not delete completed todos from challenges or groups, unless the task is broken
    await Tasks.Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      $and: [ // exclude challenge and group tasks
        {
          $or: [
            {'challenge.id': {$exists: false}},
            {'challenge.broken': {$exists: true}},
          ],
        },
        {
          $or: [
            {'group.id': {$exists: false}},
            {'group.broken': {$exists: true}},
          ],
        },
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
 * @apiParam (Path) {String} taskId The task _id or alias
 *
 * @apiExample {json} Example call:
 * curl -X "DELETE" https://habitica.com/api/v3/tasks/3d5d324d-a042-4d5f-872e-0553e228553e
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse TaskNotFound
 * @apiError (401) {NotAuthorized} Challenge A task belonging to a challenge can't be deleted.
 * @apiError (401) {NotAuthorized} Group Can't delete group tasks that are assigned to you
 * @apiError (401) {NotAuthorized} ChallengeLeader Tasks belonging to a challenge can only be edited by the leader.
 * @apiError (401) {NotAuthorized} GroupLeader Not authorized to manage tasks!
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
      let fields = requiredGroupFields.concat(' managers');
      let group = await Group.getGroup({user, groupId: task.group.id, fields});
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));
      await group.removeTask(task);
    } else if (task.challenge.id && !task.userId) { // If the task belongs to a challenge make sure the user has rights
      challenge = await Challenge.findOne({_id: task.challenge.id}).exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));
      if (challenge.leader !== user._id) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));
    } else if (task.userId !== user._id) { // If the task is owned by a user make it's the current one
      throw new NotFound(res.t('taskNotFound'));
    } else if (task.userId && task.challenge.id && !task.challenge.broken) {
      throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));
    } else if (task.group.id && task.group.assignedUsers.indexOf(user._id) !== -1 && !task.group.broken) {
      throw new NotAuthorized(res.t('cantDeleteAssignedGroupTasks'));
    }

    if (task.type !== 'todo' || !task.completed) {
      removeFromArray((challenge || user).tasksOrder[`${task.type}s`], taskId);

      let pullQuery = {$pull: {}};
      pullQuery.$pull[`tasksOrder.${task.type}s`] = task._id;
      let taskOrderUpdate = (challenge || user).update(pullQuery).exec();

      await Bluebird.all([taskOrderUpdate, task.remove()]);
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
