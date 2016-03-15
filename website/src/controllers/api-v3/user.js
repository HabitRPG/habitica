import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import common from '../../../../common';
import {
  NotFound,
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';
import * as Tasks from '../../models/task';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import Q from 'q';
import _ from 'lodash';
import * as passwordUtils from '../../libs/api-v3/password';

const sleep = common.ops.sleep;

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

    // Remove apiToken from response TODO make it private at the user level? returned in signup/login
    delete user.apiToken;

    // TODO move to model (maybe virtuals, maybe in toJSON)
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = res.locals.user._statsComputed.maxMP;

    return res.respond(200, user);
  },
};

/**
 * @api {post} /user/update-password
 * @apiVersion 3.0.0
 * @apiName updatePassword
 * @apiGroup User
 * @apiParam {string} password The old password
 * @apiParam {string} newPassword The new password
 * @apiParam {string} confirmPassword Password confirmation
 * @apiSuccess {Object} The success message
 **/
api.updatePassword = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/update-password',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.hashed_password) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingNewPassword')},
      },
      newPassword: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
    });

    if (req.body.newPassword !== req.body.confirmPassword) throw new NotAuthorized(res.t('passwordConfirmationMatch'));

    user.auth.local.hashed_password = passwordUtils.encrypt(req.body.newPassword, user.auth.local.salt); // eslint-disable-line camelcase
    await user.save();
    res.respond(200, {});
  },
};

/**
 * @api {post} /user/update-username
 * @apiVersion 3.0.0
 * @apiName updateUsername
 * @apiGroup User
 * @apiParam {string} password The password
 * @apiParam {string} username New username
 * @apiSuccess {Object} The new username
 **/
api.updateUsername = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/update-username',
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody({
      password: {
        notEmpty: {errorMessage: res.t('missingPassword')},
      },
      username: {
        notEmpty: { errorMessage: res.t('missingUsername') },
      },
    });

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (!user.auth.local.username) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    let oldPassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (oldPassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    let count = await User.count({ 'auth.local.lowerCaseUsername': req.body.username.toLowerCase() });
    if (count > 0) throw new BadRequest(res.t('usernameTaken'));

    // save username
    user.auth.local.lowerCaseUsername = req.body.username.toLowerCase();
    user.auth.local.username = req.body.username;
    await user.save();

    res.respond(200, { username: req.body.username });
  },
};


/**
 * @api {post} /user/update-email
 * @apiVersion 3.0.0
 * @apiName UpdateEmail
 * @apiGroup User
 *
 * @apiParam {string} newEmail The new email address.
 * @apiParam {string} password The user password.
 *
 * @apiSuccess {Object} An object containing the new email address
 */
api.updateEmail = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/update-email',
  async handler (req, res) {
    let user = res.locals.user;

    if (!user.auth.local.email) throw new BadRequest(res.t('userHasNoLocalRegistration'));

    req.checkBody('newEmail', res.t('newEmailRequired')).notEmpty().isEmail();
    req.checkBody('password', res.t('missingPassword')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let candidatePassword = passwordUtils.encrypt(req.body.password, user.auth.local.salt);
    if (candidatePassword !== user.auth.local.hashed_password) throw new NotAuthorized(res.t('wrongPassword'));

    user.auth.local.email = req.body.newEmail;
    await user.save();

    return res.respond(200, { email: user.auth.local.email });
  },
};

const partyMembersFields = 'profile.name stats achievements items.special';

/**
 * @api {post} /user/class/cast/:spellId Cast a spell on a target.
 * @apiVersion 3.0.0
 * @apiName UserCast
 * @apiGroup User
 *
 * @apiParam {string} spellId The spell to cast.
 * @apiParam {UUID} targetId Optional query parameter, the id of the target when casting a spell on a party member or a task.
 *
 * @apiSuccess {Object|Array} mixed Will return the modified targets. For party members only the necessary fields will be populated.
 */
api.castSpell = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/class/cast/:spellId',
  async handler (req, res) {
    let user = res.locals.user;
    let spellId = req.params.spellId;
    let targetId = req.query.targetId;

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
      if (!targetId) throw new BadRequest(res.t('targetIdUUID'));

      let task = await Tasks.Task.findOne({
        _id: targetId,
        userId: user._id,
      }).exec();
      if (!task) throw new NotFound(res.t('taskNotFound'));
      if (task.challenge.id) throw new BadRequest(res.t('challengeTasksNoCast'));

      spell.cast(user, task, req);
      await task.save();
      res.respond(200, task);
    } else if (targetType === 'self') {
      spell.cast(user, null, req);
      await user.save();
      res.respond(200, user);
    } else if (targetType === 'tasks') { // new target type when all the user's tasks are necessary
      let tasks = await Tasks.Task.find({
        userId: user._id,
        'challenge.id': {$exists: false}, // exclude challenge tasks
        $or: [ // Exclude completed todos
          {type: 'todo', completed: false},
          {type: {$in: ['habit', 'daily', 'reward']}},
        ],
      }).exec();

      spell.cast(user, tasks, req);

      let toSave = tasks.filter(t => t.isModified());
      let isUserModified = user.isModified();
      toSave.unshift(user.save());
      let saved = await Q.all(toSave);

      let response = {
        tasks: isUserModified ? _.rest(saved) : saved,
      };
      if (isUserModified) res.user = user;
      res.respond(200, response);
    } else if (targetType === 'party' || targetType === 'user') {
      let party = await Group.getGroup({groupId: 'party', user});
      // arrays of users when targetType is 'party' otherwise single users
      let partyMembers;

      if (targetType === 'party') {
        if (!party) {
          partyMembers = [user]; // Act as solo party
        } else {
          partyMembers = await User.find({'party._id': party._id}).select(partyMembersFields).exec();
        }

        spell.cast(user, partyMembers, req);
        await Q.all(partyMembers.map(m => m.save()));
      } else {
        if (!party && (!targetId || user._id === targetId)) {
          partyMembers = user;
        } else {
          if (!targetId) throw new BadRequest(res.t('targetIdUUID'));
          if (!party) throw new NotFound(res.t('partyNotFound'));
          partyMembers = await User.findOne({_id: targetId, 'party._id': party._id}).select(partyMembersFields).exec();
        }

        if (!partyMembers) throw new NotFound(res.t('userWithIDNotFound', {userId: targetId}));
        spell.cast(user, partyMembers, req);
        await partyMembers.save();
      }
      res.respond(200, partyMembers);

      if (party && !spell.silent) {
        let message = `\`${user.profile.name} casts ${spell.text()}${targetType === 'user' ? ` on ${partyMembers.profile.name}` : ' for the party'}.\``;
        party.sendChat(message);
        await party.save();
      }
    }
  },
};

/**
 * @api {post} /user/sleep Put the user in the inn.
 * @apiVersion 3.0.0
 * @apiName UserSleep
 * @apiGroup User
 *
 * @apiSuccess {Object} Will return an object with the new `user.preferences.sleep` value. Example `{preferences: {sleep: true}}`
 */
api.sleep = {
  method: 'POST',
  middlewares: [authWithHeaders(), cron],
  url: '/user/sleep',
  async handler (req, res) {
    let user = res.locals.user;
    let sleepVal = sleep(user);
    return res.respond(200, {
      preferences: {
        sleep: sleepVal,
      },
    });
  },
};

module.exports = api;
