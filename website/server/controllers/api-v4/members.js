import {model as User} from '../../models/user';
import {authWithHeaders} from '../../middlewares/auth';

let api = {};


api.getUsernameAutocompletes = {
  method: 'GET',
  url: '/members/find/:username',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    res.set('Cache-Control', 'public, max-age=300000'); // 5 minutes
    req.checkParams('username', res.t('invalidReqParams')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let username = req.params.username.toLowerCase();
    if (username[0] === '@') username = username.slice(1, username.length);

    if (username.length < 1) {
      res.respond(200, []);
      return;
    }

    let query = {'auth.local.lowerCaseUsername': {$regex: `^${username}.*`}, 'flags.verifiedUsername': true, 'preferences.searchableUsername': {$ne: false}};

    let context = req.query.context;
    let id = req.query.id;
    if (context && id) {
      if (context === 'party') {
        query['party._id'] = res.locals.user.party._id;
      } else if (context === 'privateGuild') {
        if (res.locals.user.guilds.includes(id)) {
          query.guilds = id;
        }
      }
    }
    let members = await User
      .find(query)
      .select(['profile.name', 'contributor', 'auth.local.username'])
      .limit(20)
      .exec();

    res.respond(200, members);
  },
};

module.exports = api;
