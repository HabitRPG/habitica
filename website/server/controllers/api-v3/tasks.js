import _ from 'lodash';
import moment from 'moment';
import { authWithHeaders } from '../../middlewares/auth';
import {
  taskActivityWebhook,
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
  getGroupFromTaskAndUser,
  getChallengeFromTask,
  scoreTasks,
  verifyTaskModification,
} from '../../libs/tasks';
import {
  moveTask,
  setNextDue,
  requiredGroupFields,
} from '../../libs/tasks/utils';
import common from '../../../common';
import apiError from '../../libs/apiError';

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
 * @apiError (401) {NotAuthorized} NoAccount There is no account that uses those credentials.
 */

const api = {};

/**
 * @api {post} /api/v3/tasks/user Create a new task belonging to the user
 * @apiDescription Can be passed an object to create a single task or an array of objects
 * to create multiple tasks.
 * @apiName CreateUserTasks
 * @apiGroup Task
 *
 * @apiParam (Body) {String} text The text to be displayed for the task
 * @apiParam (Body) {String="habit","daily","todo","reward"} type Task type, options are: "habit",
 *                                                                "daily", "todo", "reward".
 * @apiParam (Body) {String[]} [tags] Array of UUIDs of tags
 * @apiParam (Body) {String} [alias] Alias to assign to task
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use,
 *                                                               options are: "str", "int",
 *                                                               "per", "con"
 * @apiParam (Body) {Array} [checklist] An array of checklist items. For example,
 *                                      [{"text":"buy tools", "completed":true},
 *                                       {"text":"build shed", "completed":false}]
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {Date} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1,
 *                                                            1.5, 2; equivalent of Trivial,
 *                                                            Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must
 *                                         include: a UUID, startDate and time.
 *                                         For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3",
 *                                         "startDate":"1/16/17","time":"1/16/17" }
 * @apiParam (Body) {String="daily","weekly","monthly","yearly"} [frequency=weekly] Values "weekly"
 *                                           and "monthly" enable use of the "repeat" field.
 *                                           All frequency values enable use of the "everyX" field.
 *                                           Value "monthly" enables use of the "weeksOfMonth" and
 *                                           "daysOfMonth" fields.
 *                                           Frequency is only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,
 *                                         Days that are true will be repeated upon.
 *                                         Only valid for type "daily". Any days not specified
 *                                         will be marked as true. Days are: su, m, t, w, th,
 *                                         f, s. Value of frequency must be "weekly".
 *                                         For example, to skip repeats on Mon and
 *                                         Fri: "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily",
 *                                      the number of days until this daily
 *                                      task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively
 *                                      been checked off. Only valid for type "daily"
 * @apiParam (Body) {Integer[]} daysOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Integer[]} weeksOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available.
 *                                     Only valid for type "daily"
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit"
 *                                      If true, enables the "+" under "Directions/Action"
 *                                      for "Good habits"-
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables
 *                                        the "-" under "Directions/Action" for "Bad habits"
 * @apiParam (Body) {Number} [value=0] Only valid for type "reward." The cost
 *                                     in gold of the reward. Should be greater then or equal to 0.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "text":"Update Habitica API Documentation - Tasks",
 *       "type":"todo",
 *       "alias":"hab-api-tasks",
 *       "notes":"Update the tasks api on GitHub",
 *       "tags":["ed427623-9a69-4aac-9852-13deb9c190c3"],
 *       "checklist":[{"text":"read wiki","completed":true},{"text":"write code"}],
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
 *            {
 *              "completed": true,
 *              "text": "read wiki",
 *              "id": "91edadda-fb62-4e6e-b110-aff26f936678"
 *            },
 *            {
 *              "completed": false,
 *              "text": "write code",
 *              "id": "d1ddad50-ab22-49c4-8261-9996ae337b6a"
 *            }
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
 * @apiError (400) {BadRequest} MustBeType Task type must be one of "habit", "daily",
 *                                         "todo", "reward".
 * @apiError (400) {BadRequest} Text-ValidationFailed Path 'text' is required.
 * @apiError (400) {BadRequest} Alias-ValidationFailed Task short names can only
 *                                                     contain alphanumeric characters,
 *                                                     underscores and dashes.
 * @apiError (400) {BadRequest} Value-ValidationFailed `x` is not a valid enum value
 *                                                     for path `(body param)`.
 * @apiError (400) {BadRequest} Value-ValidationFailed Reward cost should be a
 *                                                      positive number or 0.`.
 * @apiError (401) {NotAuthorized} NoAccount There is no account that uses those credentials.
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
    const { user } = res.locals;
    const tasks = await createTasks(req, res, { user });

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    tasks.forEach(task => {
      taskActivityWebhook.send(user, {
        type: 'created',
        task,
      });
    });
  },
};

/**
 * @api {post} /api/v3/tasks/challenge/:challengeId Create a new task belonging to a challenge
 * @apiDescription Can be passed an object to create a single task or an
 * array of objects to create multiple tasks.
 * @apiName CreateChallengeTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} challengeId The id of the challenge the new task(s) will belong to
 *
 * @apiParam (Body) {String} text The text to be displayed for the task
 * @apiParam (Body) {String="habit","daily","todo","reward"} type Task type, options are: "habit",
 *                                                                "daily", "todo", "reward".
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use,
 *                                                               options are: "str",
 *                                                               "int", "per", "con".
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {Date} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1,
 *                                                            1.5, 2; equivalent of Trivial,
 *                                                            Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must
 *                                         include: a UUID, startDate and time.
 *                                         For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3",
 *                                         "startDate":"1/16/17","time":"1/16/17" }
 * @apiParam (Body) {String="daily","weekly","monthly","yearly"} [frequency=weekly] Values "weekly"
 *                                           and "monthly" enable use of the "repeat" field.
 *                                           All frequency values enable use of the "everyX" field.
 *                                           Value "monthly" enables use of the "weeksOfMonth" and
 *                                           "daysOfMonth" fields.
 *                                           Frequency is only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,
 *                                         Days that are true will be repeated upon.
 *                                         Only valid for type "daily". Any days not
 *                                         specified will be marked as true. Days are:
 *                                         su, m, t, w, th, f, s. Value of frequency must
 *                                         be "weekly". For example, to skip repeats on
 *                                         Mon and Fri: "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily", the number
 *                                      of days until this daily task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively
 *                                      been checked off. Only valid for type "daily"
 * @apiParam (Body) {Integer[]} daysOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Integer[]} weeksOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available.
 *                                     Only valid for type "daily"
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit" If true,
 *                                      enables the "+" under "Directions/Action"
 *                                      for "Good habits"
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables
 *                                        the "-" under "Directions/Action" for "Bad habits"
 * @apiParam (Body) {Number} [value=0] Only valid for type "reward." The cost in gold of the reward
 *
 * @apiParamExample {json} Request-Example:
 * {"type":"todo","text":"Test API Params"}
 *
 * @apiSuccess (201) data An object if a single task was created, otherwise an array of tasks
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"text":"Test API Params","type":"todo","notes":"",
 * "tags":[],"value":0,"priority":1,"attribute":"str",
 * "challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},
 * "group":{"assignedUsers":[],"approval":{"required":false,"approved":false,
 * "requested":false}},"reminders":[],"_id":"4a29874c-0308-417b-a909-2a7d262b49f6",
 * "createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-13T21:23:05.949Z",
 * "checklist":[],"collapseChecklist":false,"completed":false,
 * "id":"4a29874c-0308-417b-a909-2a7d262b49f6"},"notifications":[]}
 *
 * @apiError (404) {NotFound} ChecklistNotFound The specified checklist item could not be found.
 * @apiUse ChallengeNotFound
 * @apiError (400) {BadRequest} MustBeType Task type must be one of "habit",
 *                                         "daily", "todo", "reward".
 * @apiError (400) {BadRequest} Text-ValidationFailed Path 'text' is required.
 * @apiError (400) {BadRequest} Alias-ValidationFailed Task short names can only contain
 *                                                     alphanumeric characters, underscores
 *                                                     and dashes.
 * @apiError (400) {BadRequest} Value-ValidationFailed `x` is not a valid enum value
 *                                                     for path `(body param)`.
 * @apiError (401) {NotAuthorized} NoAccount There is no account that uses those credentials.
 */
api.createChallengeTasks = {
  method: 'POST',
  url: '/tasks/challenge/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;

    const challenge = await Challenge.findOne({ _id: challengeId }).exec();

    // If the challenge does not exist, or if it exists but user is not the leader -> throw error
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));

    const tasks = await createTasks(req, res, { user, challenge });

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    // If adding tasks to a challenge -> sync users
    if (challenge) challenge.addTasks(tasks);

    tasks.forEach(task => {
      res.analytics.track('challenge task created', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        taskType: task.type,
        challengeID: challenge._id,
      });
    });
  },
};

/**
 * @api {get} /api/v3/tasks/user Get a user's tasks
 * @apiName GetUserTasks
 * @apiGroup Task
 *
 * @apiParam (Query) {String="habits","dailys",
 *                   "todos","rewards","completedTodos"} type Optional query parameter to return
 *                                                            just a type of tasks. By default all
 *                                                            types will be returned except
 *                                                            completed todos that must be
 *                                                            requested separately.
 *                                                            The "completedTodos" type returns
 *                                                            only the 30 most recently completed.
 * @apiParam (Query) [dueDate] type Optional date to use for computing the nextDue field
 *                                  for each returned task.
 *
 * @apiSuccess {Array} data An array of tasks
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":[{"_id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"15 minute break",
 * "type":"reward","notes":"","tags":[],"value":10,"priority":1,"attribute":"str",
 * "challenge":{},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,
 * "requested":false}},"reminders":[],"createdAt":"2017-01-07T17:52:09.121Z",
 * "updatedAt":"2017-01-11T14:25:32.504Z","id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3"},
 * ,{"_id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3","userId":"b0413351-405f-416f-8787-947ec1c85199",
 * "alias":"prac31","text":"Practice Task 31","type":"daily","notes":"","tags":[],"value":1,
 * "priority":1,"attribute":"str","challenge":{},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},
 * "reminders":[{"time":"2017-01-13T16:21:00.074Z","startDate":"2017-01-13T16:20:00.074Z",
 * "id":"b8b549c4-8d56-4e49-9b38-b4dcde9763b9"}],"createdAt":"2017-01-13T16:34:06.632Z",
 * "updatedAt":"2017-01-13T16:49:35.762Z","checklist":[],"collapseChecklist":false,
 * "completed":true,"history":[],"streak":1,"repeat":{"su":false,"s":false,"f":true,
 * "th":true,"w":true,"t":true,"m":true},"startDate":"2017-01-13T00:00:00.000Z",
 * "everyX":1,"frequency":"weekly","id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3"}],"notifications":[]}
 *
 * @apiError (BadRequest) Invalid_request_parameters Error returned if the
 *                                                   type URL param was not correct.
 * @apiError (401) {NotAuthorized} NoAccount There is no account that uses those credentials.
 */
api.getUserTasks = {
  method: 'GET',
  url: '/tasks/user',
  middlewares: [authWithHeaders({
    // Some fields (including _id, preferences) are always loaded (see middlewares/auth)
    userFieldsToInclude: ['tasksOrder'],
  })],
  async handler (req, res) {
    const types = Tasks.tasksTypes.map(type => `${type}s`);
    types.push('completedTodos', '_allCompletedTodos'); // _allCompletedTodos is currently in BETA and is likely to be removed in future
    req.checkQuery('type', res.t('invalidTasksTypeExtra')).optional().isIn(types);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { dueDate } = req.query;

    const tasks = await getTasks(req, res, { user, dueDate });
    return res.respond(200, tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/challenge/:challengeId Get a challenge's tasks
 * @apiName GetChallengeTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} challengeId The id of the challenge from which to retrieve the tasks
 * @apiParam (Query) {String="habits","dailys","todos","rewards"} [type] Query parameter to return
 *                                                                       just a type of tasks.
 *
 * @apiExample {curl} Example use:
 * curl -i https://habitica.com/api/v3/tasks/challenge/f23c12f2-5830-4f15-9c36-e17fd729a812
 *
 * @apiSuccess {Array} data An array of tasks
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":[{"_id":"5f12bfba-da30-4733-ad01-9c42f9817975",
 * "text":"API Trial","type":"habit","notes":"","tags":[],"value":27.70767809690112,
 * "priority":1.5,"attribute":"str","challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},
 * "group":{"assignedUsers":[],"approval":{"required":false,"approved":false,
 * "requested":false}},"reminders":[],"createdAt":"2017-01-12T19:03:33.485Z",
 * "updatedAt":"2017-01-13T17:45:52.442Z","history":
 * [{"date":1484257319183,"value":18.53316748293123},
 * {"date":1484329552441,"value":27.70767809690112}],
 * "down":false,"up":true,"id":"5f12bfba-da30-4733-ad01-9c42f9817975"},
 * {"_id":"54a81d23-529c-4daa-a6f7-c5c6e7e84936","text":"Challenge TODO","type":"todo",
 * "notes":"","tags":[],"value":2,"priority":2,"attribute":"str",
 * "challenge":{"id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},
 * "group":{"assignedUsers":[],"approval":{"required":false,"approved":false,
 * "requested":false}},"reminders":[],"createdAt":"2017-01-12T19:07:10.310Z",
 * "updatedAt":"2017-01-13T20:24:51.070Z","checklist":[],
 * "collapseChecklist":false,"completed":false,"id":"54a81d23-529c-4daa-a6f7-c5c6e7e84936"}],
 * "notifications":[]}
 *
 * @apiUse ChallengeNotFound
 */
api.getChallengeTasks = {
  method: 'GET',
  url: '/tasks/challenge/:challengeId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    const types = Tasks.tasksTypes.map(type => `${type}s`);
    req.checkQuery('type', res.t('invalidTasksType')).optional().isIn(types);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { challengeId } = req.params;

    const challenge = await Challenge.findOne({
      _id: challengeId,
    }).select('group leader tasksOrder').exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    const group = await Group.getGroup({
      user,
      groupId: challenge.group,
      fields: '_id type privacy',
      optionalMembership: true,
    });
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

    const tasks = await getTasks(req, res, { user, challenge });
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
 * @apiSuccessExample {json} Example returned object:
 * {"success":true,"data":{"_id":"2b774d70-ec8b-41c1-8967-eb6b13d962ba",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"API Trial",
 * "alias":"apiTrial","type":"habit","notes":"","tags":[],"value":11.996661122825959,
 * "priority":1.5,"attribute":"str","challenge":{"taskId":"5f12bfba-da30-4733-ad01-9c42f9817975",
 * "id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},"reminders":[],
 * "createdAt":"2017-01-12T19:03:33.495Z","updatedAt":"2017-01-13T20:52:02.927Z",
 * "history":[{"value":1,"date":1484248053486},{"value":1.9747,"date":1484252965224},
 * {"value":2.9253562257358428,"date":1484252966902},
 * {"value":6.415599723011605,"date":1484329050485},
 * {"value":10.482627142836241,"date":1484329089835},
 * {"value":11.24705848799571,"date":1484329095500},
 * {"value":11.996661122825959,"date":1484329552423}],"down":false,
 * "up":true,"id":"2b774d70-ec8b-41c1-8967-eb6b13d962ba"},"notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.getTask = {
  method: 'GET',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    } else if (task.group.id && !task.userId) {
      // @TODO: Abstract this access snippet
      const fields = requiredGroupFields.concat(' managers');
      const group = await Group.getGroup({ user, groupId: task.group.id, fields });
      if (!group) throw new NotFound(res.t('messageTaskNotFound'));

      const isNotGroupLeader = group.leader !== user._id;
      if (!group.isMember(user) && isNotGroupLeader) throw new NotFound(res.t('messageTaskNotFound'));
    // If the task belongs to a challenge make sure the user has rights (leader, admin or members)
    } else if (task.challenge.id && !task.userId) {
      const challenge = await Challenge.findOne({ _id: task.challenge.id }).select('leader').exec();
      // @TODO: Abstract this access snippet
      if (!challenge) throw new NotFound(res.t('messageTaskNotFound'));
      if (!challenge.canModify(user) && !challenge.isMember(user)) {
        throw new NotFound(res.t('messageTaskNotFound'));
      }

    // If the task is owned by a user make it's the current one
    } else if (task.userId !== user._id) {
      throw new NotFound(res.t('messageTaskNotFound'));
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
 * @apiParam (Body) {String="str","int","per","con"} [attribute] User's attribute to use,
 *                                                               options are: "str", "int",
 *                                                               "per", "con".
 * @apiParam (Body) {Boolean} [collapseChecklist=false] Determines if a checklist will be displayed
 * @apiParam (Body) {String} [notes] Extra notes
 * @apiParam (Body) {Date} [date] Due date to be shown in task list. Only valid for type "todo."
 * @apiParam (Body) {Number="0.1","1","1.5","2"} [priority=1] Difficulty, options are 0.1, 1,
 *                                                            1.5, 2; equivalent of Trivial,
 *                                                            Easy, Medium, Hard.
 * @apiParam (Body) {String[]} [reminders] Array of reminders, each an object that must include:
 *                                         a UUID, startDate and time.
 * @apiParam (Body) {String="daily","weekly","monthly","yearly"} [frequency=weekly] Values "weekly"
 *                                           and "monthly" enable use of the "repeat" field.
 *                                           All frequency values enable use of the "everyX" field.
 *                                           Value "monthly" enables use of the "weeksOfMonth" and
 *                                           "daysOfMonth" fields.
 *                                           Frequency is only valid for type "daily".
 * @apiParam (Body) {String} [repeat=true] List of objects for days of the week,  Days that
 *                                         are true will be repeated upon. Only valid for type
 *                                         "daily". Any days not specified will be marked as true.
 *                                         Days are: su, m, t, w, th, f, s. Value of frequency must
 *                                         be "weekly". For example, to skip repeats on Mon and Fri:
 *                                         "repeat":{"f":false,"m":false}
 * @apiParam (Body) {Number} [everyX=1] Value of frequency must be "daily", the number
 *                                      of days until this daily task is available again.
 * @apiParam (Body) {Number} [streak=0] Number of days that the task has consecutively
 *                                      been checked off. Only valid for type "daily",
 * @apiParam (Body) {Integer[]} daysOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Integer[]} weeksOfMonth Array of integers.
 *                                      Only valid for type "daily"
 * @apiParam (Body) {Date} [startDate] Date when the task will first become available.
 *                                     Only valid for type "daily".
 * @apiParam (Body) {Boolean} [up=true] Only valid for type "habit" If true, enables
 *                                      the "+" under "Directions/Action" for "Good habits".
 * @apiParam (Body) {Boolean} [down=true] Only valid for type "habit" If true, enables the
 *                                        "-" under "Directions/Action" for "Bad habits".
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
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);
    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    // Verify that the user can modify the task.
    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    } else if (task.group.id && !task.userId) {
      // If the task is in a group and only modifying `collapseChecklist`,
      // the modification should be allowed.
      if (!group) throw new NotFound(res.t('groupNotFound'));
      const taskPayloadProps = Object.keys(req.body);

      const allowedByTaskPayload = taskPayloadProps.length === 1
        && taskPayloadProps.includes('collapseChecklist');

      if (!allowedByTaskPayload) {
        // Otherwise, verify the task modification normally.
        verifyTaskModification(task, user, group, challenge, res);
      }
    } else {
      verifyTaskModification(task, user, group, challenge, res);
    }

    // we have to convert task to an object because otherwise things
    // don't get merged correctly. Bad for performances?
    const [updatedTaskObj] = common.ops.updateTask(task.toObject(), req);
    // Sanitize differently user tasks linked to a challenge
    let sanitizedObj;

    if (!challenge && task.userId && task.challenge && task.challenge.id) {
      sanitizedObj = Tasks.Task.sanitizeUserChallengeTask(updatedTaskObj);
    } else if (!group && task.userId && task.group && task.group.id) {
      sanitizedObj = Tasks.Task.sanitizeUserGroupTask(updatedTaskObj);
    } else {
      sanitizedObj = Tasks.Task.sanitize(updatedTaskObj);
    }

    _.assign(task, sanitizedObj);

    // console.log(task.modifiedPaths(), task.toObject().repeat === tep)
    // repeat is always among modifiedPaths because mongoose changes
    // the other of the keys when using .toObject()
    // see https://github.com/Automattic/mongoose/issues/2749

    if (Object.prototype.hasOwnProperty.call(sanitizedObj, 'managerNotes')) {
      task.group.managerNotes = sanitizedObj.managerNotes;
    }

    // For daily tasks, update start date based on timezone to maintain consistency
    if (task.type === 'daily'
        && task.startDate
    ) {
      task.startDate = moment(task.startDate).utcOffset(
        -user.preferences.timezoneOffset,
      ).startOf('day').toDate();

      // If the daily task was set to repeat monthly on a day of the month, and the start date was
      // updated, the task will then need to be updated to repeat on the same day of the month as
      // the new start date. For example, if the start date is updated to 7/2/2020, the daily
      // should repeat on the 2nd day of the month. It's possible that a task can repeat monthly
      // on a week of the month, in which case we won't update the repetition at all.
      if (
        task.frequency === 'monthly'
        && task.daysOfMonth.length
      ) {
        // We also need to aware of the user's timezone. Start date is represented as UTC, so the
        // start date and day of month might be different
        task.daysOfMonth = [moment(task.startDate).utcOffset(
          -user.preferences.timezoneOffset,
        ).date()];
      }
      if (task.streak === undefined) task.streak = 0;
      task.streak = Math.trunc(task.streak);
    }

    setNextDue(task, user);
    const savedTask = await task.save();

    res.respond(200, savedTask);

    if (challenge) {
      challenge.updateTask(savedTask);
    } else if (!group) {
      taskActivityWebhook.send(user, {
        type: 'updated',
        task: savedTask,
      });
    }

    if (group) {
      res.analytics.track('task edit', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        taskType: task.type,
        groupID: group._id,
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
 *
 * @apiExample {json} Example call:
 * curl -X "POST" https://habitica.com/api/v3/tasks/test-api-params/score/up
 *
 * @apiSuccess {Object} data The user stats
 * @apiSuccess {Object} data._tmp If an item was dropped it'll be returned in te _tmp object
 * @apiSuccess {Number} data.delta The delta
 *
 * @apiSuccess (202) {Boolean} data.requiresApproval Approval was requested for team task
 * @apiSuccess (202) {String} message Acknowledgment of team task approval request
 *
 * @apiSuccessExample {json} Example result:
 * {"success":true,"data":{"delta":0.9746999906450404,"_tmp":{},"hp":49.06645205596985,
 * "mp":37.2008917491047,"exp":101.93810026267543,"gp":77.09694176716997,
 * "lvl":19,"class":"rogue","points":0,"str":5,"con":3,"int":3,"per":8,
 * "buffs":{"str":9,"int":9,"per":9,"con":9,"stealth":0,"streaks":false,
 * "snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},
 * "training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiSuccessExample {json} Example result with item drop:
 * {"success":true,"data":{"delta":1.0259567046270648,
 * "_tmp":{"quest":{"progressDelta":1.2362778290756147,"collection":1},
 * "drop":{"target":"Zombie","canDrop":true,"value":1,"key":"RottenMeat","type":"Food",
 * "dialog":"You've found Rotten Meat! Feed this to a pet and it may grow into a sturdy steed."}},
 * "hp":50,"mp":66.2390716654227,"exp":143.93810026267545,"gp":135.12889840462591,
 * "lvl":20,"class":"rogue","points":0,"str":6,"con":3,"int":3,"per":8,
 * "buffs":{"str":10,"int":10,"per":10,"con":10,"stealth":0,"streaks":false,
 * "snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},
 * "training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.scoreTask = {
  method: 'POST',
  url: '/tasks/:taskId/score/:direction',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Parameters are validated in scoreTasks

    const { user } = res.locals;
    const { taskId, direction } = req.params;
    const [taskResponse] = await scoreTasks(user, [{ id: taskId, direction }], req, res);

    const userStats = user.stats.toJSON();

    const resJsonData = _.assign({
      delta: taskResponse.delta,
      _tmp: user._tmp,
    }, userStats);

    res.respond(200, resJsonData);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/move/to/:position Move a task to a new position
 * @apiDescription Note: completed To Do's are not sortable,
 * do not appear in user.tasksOrder.todos, and are ordered by date of completion.
 * @apiName MoveTask
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id or alias
 * @apiParam (Path) {Number} position Where to move the task.
 *                                    0 = top of the list ("push to top").
 *                                   -1 = bottom of the list ("push to bottom").
 *
 * @apiSuccess {Array} data The new tasks order for the specific type that the taskID belongs to.
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":["8d7e237a-b259-46ee-b431-33621256bb0b",
 * "2b774d70-ec8b-41c1-8967-eb6b13d962ba","f03d4a2b-9c36-4f33-9b5f-bae0aed23a49"],
 * "notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.moveTask = {
  method: 'POST',
  url: '/tasks/:taskId/move/to/:position',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { taskId } = req.params;
    const to = Number(req.params.position);

    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    if (task.group.id && !task.userId) {
      if (!group || (user.guilds.indexOf(group._id) === -1 && user.party._id !== group._id)) {
        throw new NotFound(res.t('groupNotFound'));
      }
      if (task.group.assignedUsers.length !== 0
        && task.group.assignedUsers.indexOf(user._id) === -1) {
        throw new BadRequest('Use /group/:groupId/tasks/:taskId/move/to/:position route');
      }
    } else {
      verifyTaskModification(task, user, group, challenge, res);
    }

    if (task.type === 'todo' && task.completed) throw new BadRequest(res.t('cantMoveCompletedTodo'));

    const owner = challenge || user;

    // In memory updates
    const order = owner.tasksOrder[`${task.type}s`];

    moveTask(order, task._id, to);

    // Server updates
    // Cannot send $pull and $push on same field in one single op
    const pullQuery = { $pull: {} };
    pullQuery.$pull[`tasksOrder.${task.type}s`] = task.id;
    await owner.updateOne(pullQuery).exec();

    let position = to;
    if (to === -1) position = order.length - 1; // push to bottom

    const updateQuery = { $push: {} };
    updateQuery.$push[`tasksOrder.${task.type}s`] = {
      $each: [task._id],
      $position: position,
    };
    await owner.updateOne(updateQuery).exec();

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    // Only users have a version.
    if (!challenge) {
      owner._v += 1;
    }

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
 * @apiParam (Body) {Boolean} [completed=false] Whether the checklist item is checked off.
 *
 * @apiParamExample {json} Example body data:
 * {"text":"Do this subtask"}
 *
 * @apiSuccess {Object} data The updated task
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params",
 * "alias":"test-api-params","type":"todo","notes":"","tags":[],"value":0,
 * "priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6",
 * "id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},"reminders":[],
 * "createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T03:38:07.406Z",
 * "checklist":[{"id":"afe4079d-dff1-47d9-9b06-5d76c69ddb12","text":"Do this subtask",
 * "completed":false}],"collapseChecklist":false,"completed":false,
 * "id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.addChecklistItem = {
  method: 'POST',
  url: '/tasks/:taskId/checklist',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    verifyTaskModification(task, user, group, challenge, res);

    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    const newCheckListItem = Tasks.Task.sanitizeChecklist(req.body);
    task.checklist.push(newCheckListItem);
    const savedTask = await task.save();

    newCheckListItem.id = savedTask.checklist[savedTask.checklist.length - 1].id;

    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
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
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task || (!task.userId && !task.group.id)) throw new NotFound(res.t('messageTaskNotFound'));
    if (task.userId && task.userId !== user._id) {
      throw new BadRequest('Cannot score task belonging to another user.');
    } else if (task.group.id && user.guilds.indexOf(task.group.id) === -1
      && user.party._id !== task.group.id) {
      throw new BadRequest('Cannot score task belonging to another user.');
    }
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    const item = _.find(task.checklist, { id: req.params.itemId });

    if (!item) throw new NotFound(res.t('checklistItemNotFound'));
    item.completed = !item.completed;
    const savedTask = await task.save();

    res.respond(200, savedTask);

    taskActivityWebhook.send(user, {
      type: 'checklistScored',
      task: savedTask,
      item,
    });
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
 * @apiParam (Body) {String} text The replacement text for the current checklist item.
 * @apiParam (Body) {Boolean} [completed=false] Whether the checklist item is checked off.
 *
 * @apiParamExample {json} Example body:
 * {"text":"learn Czech", "completed":true}
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
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    verifyTaskModification(task, user, group, challenge, res);
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    const item = _.find(task.checklist, { id: req.params.itemId });
    if (!item) throw new NotFound(res.t('checklistItemNotFound'));

    _.merge(item, Tasks.Task.sanitizeChecklist(req.body));
    const savedTask = await task.save();

    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
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
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params",
 * "alias":"test-api-params","type":"todo","notes":"","tags":[],"value":-1,
 * "priority":2,"attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6",
 * "id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},"reminders":[],
 * "createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T19:35:41.881Z",
 * "checklist":[],"collapseChecklist":false,"completed":false,
 * "id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
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
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('itemId', res.t('itemIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    verifyTaskModification(task, user, group, challenge, res);
    if (task.type !== 'daily' && task.type !== 'todo') throw new BadRequest(res.t('checklistOnlyDailyTodo'));

    const hasItem = removeFromArray(task.checklist, { id: req.params.itemId });
    if (!hasItem) throw new NotFound(res.t('checklistItemNotFound'));

    const savedTask = await task.save();
    res.respond(200, savedTask);
    if (challenge) challenge.updateTask(savedTask);
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
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params",
 * "alias":"test-api-params","type":"todo","notes":"",
 * "tags":["3d5d324d-a042-4d5f-872e-0553e228553e"],"value":-1,"priority":2,"attribute":"int",
 * "challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6",
 * "id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},"reminders":[],
 * "createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T19:41:29.466Z",
 * "checklist":[],"collapseChecklist":false,"completed":false,
 * "id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},"notifications":[]}
 *
 * @apiUse TaskNotFound
 * @apiError (400) {BadRequest} Invalid-request-parameters "tagId" must be a valid UUID
 *                                                         corresponding to a tag belonging
 *                                                         to the user.
 * @apiError (400) {BadRequest} TagExists The task is already tagged with given tag.
 */
api.addTagToTask = {
  method: 'POST',
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    const userTags = user.tags.map(tag => tag.id);
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID().isIn(userTags);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('messageTaskNotFound'));
    const { tagId } = req.params;

    const alreadyTagged = task.tags.indexOf(tagId) !== -1;
    if (alreadyTagged) throw new BadRequest(res.t('alreadyTagged'));

    task.tags.push(tagId);

    const savedTask = await task.save();
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
 * {"success":true,"data":{"_id":"84f02d6a-7b43-4818-a35c-d3336cec4880",
 * "userId":"b0413351-405f-416f-8787-947ec1c85199","text":"Test API Params",
 * "alias":"test-api-params","type":"todo","notes":"","tags":[],"value":-1,"priority":2,
 * "attribute":"int","challenge":{"taskId":"4a29874c-0308-417b-a909-2a7d262b49f6",
 * "id":"f23c12f2-5830-4f15-9c36-e17fd729a812"},"group":{"assignedUsers":[],
 * "approval":{"required":false,"approved":false,"requested":false}},"reminders":[],
 * "createdAt":"2017-01-13T21:23:05.949Z","updatedAt":"2017-01-14T20:02:18.206Z","checklist":[],
 * "collapseChecklist":false,"completed":false,"id":"84f02d6a-7b43-4818-a35c-d3336cec4880"},
 * "notifications":[]}
 *
 * @apiUse TaskNotFound
 * @apiUse TagNotFound
 */
api.removeTagFromTask = {
  method: 'DELETE',
  url: '/tasks/:taskId/tags/:tagId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('tagId', res.t('tagIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('messageTaskNotFound'));

    const hasTag = removeFromArray(task.tags, req.params.tagId);
    if (!hasTag) throw new NotFound(res.t('tagNotFound'));

    const savedTask = await task.save();
    res.respond(200, savedTask);
  },
};

/**
 * @api {post} /api/v3/tasks/unlink-all/:challengeId Unlink all tasks from a challenge
 * @apiName UnlinkAllTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} challengeId The challenge _id
 * @apiParam (Query) {String='keep-all','remove-all'} keep Specifies if tasks
 *                                                         should be kept(keep-all) or
 *                                                         removed(remove-all) after the unlink.
 *
 * @apiExample {curl} Example call:
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
    req.checkQuery('keep', apiError('keepOrRemoveAll')).notEmpty().isIn(['keep-all', 'remove-all']);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { keep } = req.query;
    const { challengeId } = req.params;

    const tasks = await Tasks.Task.find({
      'challenge.id': challengeId,
      userId: user._id,
    }).exec();

    const validTasks = tasks.every(task => task.challenge.broken);

    if (!validTasks) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));

    if (keep === 'keep-all') {
      await Promise.all(tasks.map(task => {
        task.challenge = {};
        return task.save();
      }));
    } else { // remove
      const toSave = [];

      tasks.forEach(task => {
        if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
          removeFromArray(user.tasksOrder[`${task.type}s`], task._id);
        }

        toSave.push(task.remove());
      });

      toSave.push(user.save());

      await Promise.all(toSave);
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
 * @apiParam (Query) {String='keep','remove'} keep  Specifies if the task should
 *                                                  be kept(keep) or removed(remove).
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
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty().isUUID();
    req.checkQuery('keep', apiError('keepOrRemove')).notEmpty().isIn(['keep', 'remove']);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { keep } = req.query;
    const { taskId } = req.params;

    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id, { userId: user._id });

    if (!task) throw new NotFound(res.t('messageTaskNotFound'));
    if (!task.challenge.id) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));
    if (!task.challenge.broken) throw new BadRequest(res.t('cantOnlyUnlinkChalTask'));

    if (keep === 'keep') {
      task.challenge = {};
      await task.save();
    } else { // remove
      if (task.type !== 'todo' || !task.completed) { // eslint-disable-line no-lonely-if
        removeFromArray(user.tasksOrder[`${task.type}s`], taskId);
        await Promise.all([user.save(), task.remove()]);
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
 * @apiDescription Deletes all of a user's completed To Do's except
 * those belonging to active Challenges and Group Plans.
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
    const { user } = res.locals;

    // Clear completed todos
    // Do not delete completed todos from challenges or groups, unless the task is broken
    await Tasks.Task.remove({
      userId: user._id,
      type: 'todo',
      completed: true,
      $and: [ // exclude challenge and group tasks
        {
          $or: [
            { 'challenge.id': { $exists: false } },
            { 'challenge.broken': { $exists: true } },
          ],
        },
        {
          $or: [
            { 'group.id': { $exists: false } },
            { 'group.broken': { $exists: true } },
          ],
        },
      ],
    }).exec();

    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/tasks/:taskId Delete a task
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
 * @apiError (401) {NotAuthorized} ChallengeLeader Tasks belonging to a challenge
 *                                                 can only be edited by the leader.
 * @apiError (401) {NotAuthorized} GroupLeader Not authorized to manage tasks!
 */
api.deleteTask = {
  method: 'DELETE',
  url: '/tasks/:taskId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }
    const group = await getGroupFromTaskAndUser(task, user);
    const challenge = await getChallengeFromTask(task);
    verifyTaskModification(task, user, group, challenge, res);

    if (task.group.id && !task.userId) {
      await group.removeTask(task);
    } else if (task.userId && task.challenge.id && !task.challenge.broken) {
      throw new NotAuthorized(res.t('cantDeleteChallengeTasks'));
    } else if (
      task.group.id
      && task.group.assignedUsers.indexOf(user._id) !== -1
      && !task.group.broken
    ) {
      throw new NotAuthorized(res.t('cantDeleteAssignedGroupTasks'));
    }

    if (task.type !== 'todo' || !task.completed) {
      removeFromArray((challenge || user).tasksOrder[`${task.type}s`], taskId);

      const pullQuery = { $pull: {} };
      pullQuery.$pull[`tasksOrder.${task.type}s`] = task._id;
      const taskOrderUpdate = (challenge || user).updateOne(pullQuery).exec();

      // Update the user version field manually,
      // it cannot be updated in the pre update hook
      // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
      if (!challenge) user._v += 1;

      await Promise.all([taskOrderUpdate, task.remove()]);
    } else {
      await task.remove();
    }

    res.respond(200, {});

    if (challenge) {
      challenge.removeTask(task);
    } else {
      taskActivityWebhook.send(user, {
        type: 'deleted',
        task,
      });
    }
  },
};

export default api;
