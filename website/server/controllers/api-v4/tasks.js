import _ from 'lodash';
import { authWithHeaders } from '../../middlewares/auth';
import { scoreTasks } from '../../libs/tasks';

const api = {};

/**
 * @apiIgnore
 * @api {post} /api/v4/tasks/bulk-score Score multiple tasks
 * @apiName ScoreTasks
 * @apiGroup Task
 *
 * @apiParam (Body) {Object[]} body An array with the data on the tasks to score
 * @apiParam (Body) {String} body.*.id A task identifier, either the id or alias
 * @apiParam (Body) {String="up","down"} body.*.direction The direction in which to score the task
 *
 * @apiParamExample {json} Request-Example:
 * [{ "id": "a task id", "direction": "up" },
 * { "id": "a 2nd task id", "direction": "down" }]
 *
 * @apiSuccess {Object} data The user stats and a tasks object
 * @apiSuccess {Object[]} data.tasks An array of results with an object for each scored task
 * @apiSuccess {Object[]} data.tasks.*.id The id of the task scored
 * @apiSuccess {Object[]} data.tasks.*.delta The delta
 * @apiSuccess {Object[]} data.tasks.*._tmp If an item was dropped when scoring a task it'll
 * be returned in the _tmp object for that task
 *
 * @apiSuccess {Boolean} data.requiresApproval Approval was requested for team task
 * @apiSuccess {String} message Acknowledgment of team task approval request
 *
 * @apiSuccessExample {json} Example result:
 * {"success":true,"data":{"tasks": [{"id": "task id", "delta":0.9746999906450404,
 * "_tmp":{}],"hp":50,
 * "mp":37.2008917491047,"exp":101.93810026267543,"gp":77.09694176716997,
 * "lvl":19,"class":"rogue","points":0,"str":5,"con":3,"int":3,
 * "per":8,"buffs":{"str":9,"int":9,"per":9,"con":9,"stealth":0,"streaks":false,
 * "snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},
 * "training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiSuccessExample {json} Example result with item drop:
 * {"success":true,"data":{"tasks": [{"id": "task-id", delta":1.0259567046270648,
 * "_tmp":{"quest":{"progressDelta":1.2362778290756147,"collection":1},"drop":{"target":"Zombie",
 * "canDrop":true,"value":1,"key":"RottenMeat","type":"Food",
 * "dialog":"You've found Rotten Meat! Feed this to a pet and it may grow into a sturdy steed."}}],
 * "hp":50,"mp":66.2390716654227,"exp":143.93810026267545,"gp":135.12889840462591,"lvl":20,
 * "class":"rogue","points":0,"str":6,"con":3,"int":3,"per":8,"buffs":{"str":10,"int":10,"per":10,
 * "con":10,"stealth":0,"streaks":false,"snowball":false,"spookySparkles":false,
 * "shinySeed":false,"seafoam":false},"training":{"int":0,"per":0,"str":0,"con":0}},
 * "notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.scoreTasks = {
  method: 'POST',
  url: '/tasks/bulk-score',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // Body is validated in scoreTasks

    const { user } = res.locals;
    const tasksResponses = await scoreTasks(user, req.body, req, res);

    const userStats = user.stats.toJSON();
    const resJsonData = _.assign({ tasks: tasksResponses }, userStats);
    res.respond(200, resJsonData);
  },
};

export default api;
