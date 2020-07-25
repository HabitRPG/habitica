import { authWithHeaders } from '../../../middlewares/auth';
import {
  castSpell,
} from '../../../libs/spells';

const api = {};

/*
* NOTE most spells routes are still in the v3 controller
* here there are only routes that had to be split from the v3 version because of
* some breaking change (for example because their returned the entire user object).
*/

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {post} /api/v4/user/class/cast/:spellId Cast a skill (spell) on a target
 * @apiName UserCast
 * @apiGroup User
 *

 * @apiParam (Path) {String=fireball, mpheal, earth, frost, smash,
 *                   defensiveStance, valorousPresence, intimidate, pickPocket,
 *                   backStab, toolsOfTrade, stealth, heal, protectAura, brightness,
 *                   healAll} spellId The skill to cast.
 * @apiParam (Query) {UUID} targetId Query parameter, necessary if the spell
 *                          is cast on a party member or task.
 *                          Not used if the spell is case on the user or the user's current party.
 * @apiParamExample {json} Query example:
 * Cast "Pickpocket" on a task:
 *  https://habitica.com/api/v3/user/class/cast/pickPocket?targetId=fd427623...
 *
 * Cast "Tools of the Trade" on the party:
 *  https://habitica.com/api/v3/user/class/cast/toolsOfTrade
 *
 * @apiSuccess data Will return the modified targets.
 *                  For party members only the necessary fields will be populated.
 *                  The user is always returned.
 *
 * @apiDescription Skill Key to Name Mapping
 * Mage
 * fireball: "Burst of Flames"
 * mpheal: "Ethereal Surge"
 * earth: "Earthquake"
 * frost: "Chilling Frost"
 *
 * Warrior
 * smash: "Brutal Smash"
 * defensiveStance: "Defensive Stance"
 * valorousPresence: "Valorous Presence"
 * intimidate: "Intimidating Gaze"
 *
 * Rogue
 * pickPocket: "Pickpocket"
 * backStab: "Backstab"
 * toolsOfTrade: "Tools of the Trade"
 * stealth: "Stealth"
 *
 * Healer
 * heal: "Healing Light"
 * protectAura: "Protective Aura"
 * brightness: "Searing Brightness"
 * healAll: "Blessing"
 *
 * @apiError (400) {NotAuthorized} Not enough mana.
 * @apiUse TaskNotFound
 * @apiUse PartyNotFound
 * @apiUse UserNotFound
 */
api.castSpell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/class/cast/:spellId',
  async handler (req, res) {
    await castSpell(req, res, {
      isV3: false,
    });
  },
};

export default api;
