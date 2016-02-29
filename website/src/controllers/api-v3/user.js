import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';

let api = {};

/**
 * @api {get} /user Get the authenticated user's profile
 * @apiVersion 3.0.0
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiSuccess {Object} user The user object
 */
api.getUser = {
  method: 'GET',
  middlewares: [authWithHeaders(), cron],
  url: '/user',
  async handler (req, res) {
    let user = res.locals.user.toJSON();

    // Remove apiToken from resonse TODO make it priavte at the user level? returned in signup/login
    delete user.apiToken;

    // TODO move to model (maybe virtuals, maybe in toJSON)
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    return res.respond(200, user);
  },
};

/**
 * @api {post} /email/update
 * @apiVersion 3.0.0
 * @apiName EmailUpdate
 * @apiGroup User
 *
 * @apiSuccess {Object} OK
 **/
api.updateEmail = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/email/update',
  async handler (req, res) {
    let user = res.locals.user.toJSON();

    req.checkParams('newEmail', res.t('newEmailRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    console.log('+++ req.params is', req.params);
    console.log('+++ req.body is', req.body);
    console.log('email is', user.auth.local.email);
    console.log('+++ user.auth.local is', user.auth.local);

    // check that this user has a local account
    // check that a new email is provided
    
    // check password
    // save new email

    return res.respond(200, 'ok');
  }
};

export default api;
