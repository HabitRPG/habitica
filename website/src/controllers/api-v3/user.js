import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import { 
  PreconditionFailed
} from "../../libs/api-v3/errors";
// import validator from 'validator';

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
 * @api {post} /email/update
 * @apiVersion 3.0.0
 * @apiName EmailUpdate
 * @apiGroup User
 *
 * @apiSuccess {Object} { status: 'ok' }
 **/
api.updateEmail = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/email/update',
  async handler (req, res) {    
    let user = res.locals.user.toJSON();
    console.log('+++ user.auth.local is', user.auth.local);
    console.log("+++ user.auth.facebook is", user.auth.facebook);

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
 
    if (!user.auth.local.email) throw new PreconditionFailed(res.t('userHasNoLocalRegistration'));

    // check password
    
    // save new email

    return res.respond(200, {status:'ok'});
  }
};

export default api;
