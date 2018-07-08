import { authWithHeaders } from '../../middlewares/auth';
import {
  model as User,
} from '../../models/user';

const api = {};

/**
 * @api {get} /api/v4/user Get the authenticated user's profile
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiDescription The user profile contains data related to the authenticated user including (but not limited to);
 * Achievements
 * Authentications (including types and timestamps)
 * Challenges
 * Flags (including armoire, tutorial, tour etc...)
 * Guilds
 * History (including timestamps and values)
 * Inbox (without messages in v4)
 * Invitations (to parties/guilds)
 * Items (character's full inventory)
 * New Messages (flags for groups/guilds that have new messages)
 * Notifications
 * Party (includes current quest information)
 * Preferences (user selected prefs)
 * Profile (name, photo url, blurb)
 * Purchased (includes purchase history, gem purchased items, plans)
 * PushDevices (identifiers for mobile devices authorized)
 * Stats (standard RPG stats, class, buffs, xp, etc..)
 * Tags
 * TasksOrder (list of all ids for dailys, habits, rewards and todos)
 *
 * @apiParam (Query) {UUID} userFields A list of comma separated user fields to be returned instead of the entire document. Notifications are always returned.
 *
 * @apiExample {curl} Example use:
 * curl -i https://habitica.com/api/v3/user?userFields=achievements,items.mounts
 *
 * @apiSuccess {Object} data The user object
 *
 * @apiSuccessExample {json} Result:
 *  {
 *   "success": true,
 *   "data": {
 *   --  User data included here, for details of the user model see:
 *   --  https://github.com/HabitRPG/habitica/tree/develop/website/server/models/user
 *   }
 * }
 *
*/
api.getUser = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user;
    let userToJSON = user.toJSON();

    // Remove apiToken from response TODO make it private at the user level? returned in signup/login
    delete userToJSON.apiToken;

    if (!req.query.userFields) {
      let {daysMissed} = user.daysUserHasMissed(new Date(), req);
      userToJSON.needsCron = false;
      if (daysMissed > 0) userToJSON.needsCron = true;
      User.addComputedStatsToJSONObj(userToJSON.stats, userToJSON);
    }

    return res.respond(200, userToJSON);
  },
};

module.exports = api;
