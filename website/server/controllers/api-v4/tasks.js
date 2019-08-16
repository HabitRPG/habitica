import { authWithHeaders } from '../../middlewares/auth';
import { scoreTasks } from '../../libs/taskManager';
import _ from 'lodash';

let api = {};

/**
 * @api {post} /api/v4/tasks/bulk-score Score multiple tasks
 * @apiName ScoreTasks
 * @apiGroup Task
 *
 * @apiSuccess {Object} data The user stats
 * @apiSuccess {Object} data._tmp If an item was dropped it'll be returned in te _tmp object
 * @apiSuccess {Number} data.delta The delta
 *
 * @apiSuccessExample {json} Example result:
 * {"success":true,"data":{"delta":0.9746999906450404,"_tmp":{},"hp":49.06645205596985,"mp":37.2008917491047,"exp":101.93810026267543,"gp":77.09694176716997,"lvl":19,"class":"rogue","points":0,"str":5,"con":3,"int":3,"per":8,"buffs":{"str":9,"int":9,"per":9,"con":9,"stealth":0,"streaks":false,"snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},"training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiSuccessExample {json} Example result with item drop:
 * {"success":true,"data":{"delta":1.0259567046270648,"_tmp":{"quest":{"progressDelta":1.2362778290756147,"collection":1},"drop":{"target":"Zombie","canDrop":true,"value":1,"key":"RottenMeat","type":"Food","dialog":"You've found Rotten Meat! Feed this to a pet and it may grow into a sturdy steed."}},"hp":50,"mp":66.2390716654227,"exp":143.93810026267545,"gp":135.12889840462591,"lvl":20,"class":"rogue","points":0,"str":6,"con":3,"int":3,"per":8,"buffs":{"str":10,"int":10,"per":10,"con":10,"stealth":0,"streaks":false,"snowball":false,"spookySparkles":false,"shinySeed":false,"seafoam":false},"training":{"int":0,"per":0,"str":0,"con":0}},"notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.scoreTasks = {
  method: 'POST',
  url: '/tasks/bulk-score',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let data = await scoreTasks(user, req.body, req, res);

    let userStats = user.stats.toJSON();
    let resJsonData = _.assign({responses: data.taskResponses, _tmp: user._tmp}, userStats);
    res.respond(200, resJsonData);
  },
};

module.exports = api;
