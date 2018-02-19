import {
  model as Group,
  TAVERN_ID as tavernId,
} from '../../models/group';

let api = {};

async function getWorldBoss () {
  let tavern = await Group
    .findById(tavernId)
    .select('quest.progress quest.key quest.active quest.extra')
    .exec();
  if (tavern && tavern.quest && tavern.quest.active) {
    return tavern.quest;
  }
  return {};
}

/**
 * @api {get} /api/v3/world-state Get the state for the game world
 * @apiDescription Does not require authentication.
 * @apiName WorldStateGet
 * @apiGroup WorldState
 *
 * @apiSuccess {Object} data.worldBoss.active Boolean, true if world boss quest is underway
 * @apiSuccess {Object} data.worldBoss.extra.worldDmg Object with NPC names as Boolean properties, true if they are affected by Rage Strike
 * @apiSuccess {Object} data.worldBoss.key Quest content key for the world boss
 * @apiSuccess {Object} data.worldBoss.progress.hp Current Health of the world boss
 * @apiSuccess {Object} data.worldBoss.progress.rage Current Rage of the world boss
 *
 */
api.getWorldState = {
  method: 'GET',
  url: '/world-state',
  async handler (req, res) {
    let worldState = {};

    worldState.worldBoss = await getWorldBoss();

    res.respond(200, worldState);
  },
};

module.exports = api;
