import { authWithHeaders } from '../../../middlewares/auth';
import common from '../../../../common';
import {
  model as Group,
} from '../../../models/group';
import {
  NotAuthorized,
  NotFound,
} from '../../../libs/errors';
import {
  castTaskSpell,
  castMultiTaskSpell,
  castSelfSpell,
  castPartySpell,
  castUserSpell,
} from '../../../libs/spells';

const partyMembersFields = 'profile.name stats achievements items.special';

let api = {};

/**
 * @api {post} /api/v3/user/class/cast/:spellId Cast a skill (spell) on a target
 * @apiName UserCast
 * @apiGroup User
 *

 * @apiParam (Path) {String=fireball, mpheal, earth, frost, smash, defensiveStance, valorousPresence, intimidate, pickPocket, backStab, toolsOfTrade, stealth, heal, protectAura, brightness, healAll} spellId The skill to cast.
 * @apiParam (Query) {UUID} targetId Query parameter, necessary if the spell is cast on a party member or task. Not used if the spell is case on the user or the user's current party.
 * @apiParamExample {json} Query example:
 * Cast "Pickpocket" on a task:
 *  https://habitica.com/api/v3/user/class/cast/pickPocket?targetId=fd427623...
 *
 * Cast "Tools of the Trade" on the party:
 *  https://habitica.com/api/v3/user/class/cast/toolsOfTrade
 *
 * @apiSuccess data Will return the modified targets. For party members only the necessary fields will be populated. The user is always returned.
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
    let user = res.locals.user;
    let spellId = req.params.spellId;
    let targetId = req.query.targetId;
    const quantity = req.body.quantity || 1;

    // optional because not required by all targetTypes, presence is checked later if necessary
    req.checkQuery('targetId', res.t('targetIdUUID')).optional().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let klass = common.content.spells.special[spellId] ? 'special' : user.stats.class;
    let spell = common.content.spells[klass][spellId];

    if (!spell) throw new NotFound(res.t('spellNotFound', {spellId}));
    if (spell.mana > user.stats.mp) throw new NotAuthorized(res.t('notEnoughMana'));
    if (spell.value > user.stats.gp && !spell.previousPurchase) throw new NotAuthorized(res.t('messageNotEnoughGold'));
    if (spell.lvl > user.stats.lvl) throw new NotAuthorized(res.t('spellLevelTooHigh', {level: spell.lvl}));

    let targetType = spell.target;

    if (targetType === 'task') {
      const results = await castTaskSpell(res, req, targetId, user, spell, quantity);
      res.respond(200, {
        user: results[0],
        task: results[1],
      });
    } else if (targetType === 'self') {
      await castSelfSpell(req, user, spell, quantity);
      res.respond(200, { user });
    } else if (targetType === 'tasks') { // new target type in v3: when all the user's tasks are necessary
      const response = await castMultiTaskSpell(req, user, spell, quantity);
      res.respond(200, response);
    } else if (targetType === 'party' || targetType === 'user') {
      const party = await Group.getGroup({groupId: 'party', user});
      // arrays of users when targetType is 'party' otherwise single users
      let partyMembers;

      if (targetType === 'party') {
        partyMembers = await castPartySpell(req, party, partyMembers, user, spell, quantity);
      } else {
        partyMembers = await castUserSpell(res, req, party, partyMembers, targetId, user, spell, quantity);
      }

      let partyMembersRes = Array.isArray(partyMembers) ? partyMembers : [partyMembers];

      // Only return some fields.
      // See comment above on why we can't just select the necessary fields when querying
      partyMembersRes = partyMembersRes.map(partyMember => {
        return common.pickDeep(partyMember.toJSON(), common.$w(partyMembersFields));
      });

      res.respond(200, {
        partyMembers: partyMembersRes,
        user,
      });

      if (party && !spell.silent) {
        let message = `\`${user.profile.name} casts ${spell.text()}${targetType === 'user' ? ` on ${partyMembers.profile.name}` : ' for the party'}.\``;
        party.sendChat(message);
        await party.save();
      }
    }
  },
};

module.exports = api;
