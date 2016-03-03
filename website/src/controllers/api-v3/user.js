import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import {
  PreconditionFailed,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as passwordUtils from '../../libs/api-v3/password';

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

    // Remove apiToken from response TODO make it priavte at the user level? returned in signup/login
    delete user.apiToken;

    // TODO move to model (maybe virtuals, maybe in toJSON)
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    return res.respond(200, user);
  },
};

/**
 * @api {post} /user/update-email
 * @apiVersion 3.0.0
 * @apiName EmailUpdate
 * @apiGroup User
 *
 * @apiSuccess {Object} { status: 'ok' }
 **/
api.updateEmail = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/update-email',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.email) throw new PreconditionFailed(res.t('userHasNoLocalRegistration'));

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    req.checkBody('password', res.t('missingPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // check password
    let candidatePassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (candidatePassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    // save new email
    user.auth.local.email = req.body.newEmail;
    await user.save();

    return res.respond(200, { status: 'ok', email: user.auth.local.email });
  },
};

export default api;
