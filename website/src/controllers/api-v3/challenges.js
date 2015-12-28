import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { model as Challenge } from '../../models/challenge';

let api = {};

/**
 * @api {get} /challenges Get challenges for a user
 * @apiVersion 3.0.0
 * @apiName GetChallenges
 * @apiGroup Challenge
 *
 * @apiSuccess {Array} challenges An array of challenges
 */
api.getChallenges = {
  method: 'GET',
  url: '/challenges',
  middlewares: [authWithHeaders(), cron],
  handler (req, res, next) {
    let user = res.locals.user;

    let groups = user.guilds || [];
    if (user.party._id) groups.push(user.party._id);
    groups.push('habitrpg'); // Public challenges

    Challenge.find({
      $or: [
        {_id: {$in: user.challenges}}, // Challenges where the user is participating
        {group: {$in: groups}}, // Challenges in groups where I'm a member
        {leader: user._id}, // Challenges where I'm the leader
      ],
      _id: {$ne: '95533e05-1ff9-4e46-970b-d77219f199e9'}, // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug TODO revisit
    })
    .sort('-official -timestamp')
    // TODO populate
    // .populate('group', '_id name type')
    // .populate('leader', 'profile.name')
    .exec()
    .then(challenges => {
      res.respond(200, challenges);
    })
    .catch(next);
  },
};

export default api;
