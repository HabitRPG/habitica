import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import { 
  PreconditionFailed,
  BadRequest
} from "../../libs/api-v3/errors";
import { model as User } from "../../models/user";
import * as passwordUtils from '../../libs/api-v3/password';
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

    // console.log('+++ user.auth.local is', user.auth.local);
    // console.log("+++ user.auth.facebook is", user.auth.facebook);

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    req.checkBody('password', res.t('missingPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
 
    if (!user.auth.local.email) throw new PreconditionFailed(res.t('userHasNoLocalRegistration'));

    // check password
    let temp_user = await User.findOne({ _id: user._id}, {"auth.local": 1}).exec();
    let candidate_password = passwordUtils.encrypt(req.body.password, temp_user.auth.local.salt);
    console.log("+++ +++ temp_user is", temp_user);
    console.log("+++ +++ candidate passwd is", candidate_password);
    if (candidate_password !== temp_user.auth.local.hashed_password) throw new BadRequest();
    

    // save new email

    return res.respond(200, {status:'ok'});
  }
};

export default api;
