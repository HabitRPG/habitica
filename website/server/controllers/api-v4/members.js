import {model as User} from '../../models/user';

let api = {};


api.getUsernameAutocompletes = {
  method: 'GET',
  url: '/members/find/:username',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('username', res.t('invalidReqParams')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let username = req.params.username.toLowerCase();
    if (username[0] === '@') username = username.slice(1, username.length);

    if (username.length < 2) {
      res.respond(200, []);
      return;
    }

    let members = await User
      .find({'auth.local.lowerCaseUsername': {$regex: `.*${username}.*`}, 'flags.verifiedUsername': true})
      .select(['profile.name', 'contributor', 'auth.local.username'])
      .limit(20)
      .exec();

    res.respond(200, members);
  },
};

module.exports = api;
