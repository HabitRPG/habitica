import {
  getCurrentEvent,
  getCurrentEventList,
  getWorldBoss,
} from '../../libs/worldState';

const api = {};

/**
 * @api {get} /api/v3/world-state Get the state for the game world
 * @apiDescription Does not require authentication.
 * @apiName WorldStateGet
 * @apiGroup WorldState
 *
 * @apiSuccess {Object} data.worldBoss.active Boolean, true if world boss quest is underway
 * @apiSuccess {Object} data.worldBoss.extra.worldDmg Object with NPC names
 *                                                    as Boolean properties, true if they
 *                                                    are affected by Rage Strike.
 * @apiSuccess {Object} data.worldBoss.key String, Quest content key for the world boss
 * @apiSuccess {Object} data.worldBoss.progress.hp Number, Current Health of the world boss
 * @apiSuccess {Object} data.worldBoss.progress.rage Number, Current Rage of the world boss
 * @apiSuccess {Object} data.npcImageSuffix String, trailing component of NPC image filenames
 * @apiSuccess {Object} data.currentEvent The current active event
 *
 */
api.getWorldState = {
  method: 'GET',
  url: '/world-state',
  async handler (req, res) {
    const worldState = {};

    worldState.worldBoss = await getWorldBoss();
    worldState.currentEvent = getCurrentEvent();
    worldState.npcImageSuffix = worldState.currentEvent ? worldState.currentEvent.npcImageSuffix : '';

    worldState.currentEventList = getCurrentEventList();

    res.respond(200, worldState);
  },
};

export default api;
