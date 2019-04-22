import {model as User} from '../../models/user';
import {authWithHeaders} from '../../middlewares/auth';
import {chatModel as Chat} from '../../models/message';
import _  from 'lodash';

let api = {};


api.getUsernameAutocompletes = {
  method: 'GET',
  url: '/members/find/:username',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    // res.set('Cache-Control', 'public, max-age=300000'); // 5 minutes
    req.checkParams('username', res.t('invalidReqParams')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let username = req.params.username.toLowerCase();
    if (username[0] === '@') username = username.slice(1, username.length);

    if (username.length < 1) {
      res.respond(200, []);
      return;
    }

    let commonQuery = {
      'flags.verifiedUsername': true,
      'auth.blocked': {$ne: true},
      'flags.chatRevoked': {$ne: true},
      'auth.local.lowerCaseUsername': {$regex: `^${username}.*`},
    };
    let query = Object.assign({}, commonQuery);

    let context = req.query.context;
    let groupID = req.query.id;

    let members = [];
    let isPublicSpace = true;
    if (context && groupID) {
      if (context === 'party' && res.locals.user.party._id === groupID) {
        query['party._id'] = groupID;
        isPublicSpace = false;
      } else if (context === 'privateGuild' && res.locals.user.guilds.includes(groupID)) {
        query.guilds = groupID;
        isPublicSpace = false;
      } else if (context !== 'publicGuild' && context !== 'tavern') {
        res.respond(200, []);
        return;
      }

      let recentChats = await Chat
        .find({groupId: groupID, username: {$regex: `^${username}.*`}})
        .select(['uuid'])
        .sort({timestamp: -1})
        .limit(200)
        .exec();
      let recentChatters = _.uniq(recentChats.map((message) => {
        return message.uuid;
      }));

      let recentChatQuery = Object.assign({}, commonQuery);
      recentChatQuery._id = {$in: recentChatters};
      query._id = {$nin: recentChatters};
      members = await User
        .find(recentChatQuery)
        .select(['profile.name', 'contributor', 'auth.local.username'])
        .sort({'auth.timestamps.loggedin': -1})
        .limit(5)
        .exec();
    }

    if (members.length < 5) {
      if (isPublicSpace) {
        query['preferences.searchableUsername'] = {$ne: false};
      }
      let secondFetch = await User
        .find(query)
        .select(['profile.name', 'contributor', 'auth.local.username'])
        .sort({'auth.timestamps.loggedin': -1})
        .limit(5 - members.length)
        .exec();
      members = members.concat(secondFetch);
    }
    res.respond(200, members);
  },
};

module.exports = api;
