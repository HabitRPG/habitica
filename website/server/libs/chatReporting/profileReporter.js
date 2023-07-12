import nconf from 'nconf';
import { model as User } from '../../models/user';
import { getUserInfo, sendTxn } from '../email';
import * as slack from '../slack';

import ChatReporter from './chatReporter';
import {
  BadRequest,
  NotFound,
} from '../errors';

const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL')
  .split(',')
  .map(email => ({ email, canSend: true }));

export default class ProfileReporter extends ChatReporter {
  constructor (req, res) {
    super(req, res);

    this.user = res.locals.user;
  }

  async validate () {
    this.req.checkParams('memberId', this.res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    const flaggedUser = await User.findOne(
      { _id: this.req.params.memberId },
      { auth: 1, profile: 1 },
    ).exec();
    if (!flaggedUser) {
      throw new NotFound(this.res.t('userWithIDNotFound', { userId: this.req.params.memberId }));
    }

    if (flaggedUser.profile.flags && flaggedUser.profile.flags[this.user._id]
      && !this.user.hasPermission('moderator')) {
      throw new BadRequest('A profile can not be flagged more than once by the same user.');
    }

    const { comment, source } = this.req.body;

    return { flaggedUser, comment, source };
  }

  getEmailVariables (flaggedUser) {
    const reportingUserData = {
      user: this.user.profile.name,
      username: this.user.auth.local.username,
      uuid: this.user._id,
      email: getUserInfo(this.user, ['email']).email,
    };

    const flaggedUserData = {
      user: flaggedUser.profile.name,
      username: flaggedUser.auth.local.username,
      uuid: flaggedUser._id,
      email: getUserInfo(flaggedUser, ['email']).email,
    };

    return [
      ...this.createGenericAuthorVariables('REPORTER', reportingUserData),
      ...this.createGenericAuthorVariables('FLAGGED', flaggedUserData),
    ];
  }

  async flagProfile (flaggedUser, comment, source) {
    const timestamp = new Date();
    // Log user ids that have flagged the account
    if (!flaggedUser.profile.flags) {
      flaggedUser.profile.flags = {};
    }

    flaggedUser.profile.flags[this.user._id] = {
      comment,
      source,
      timestamp,
    };
    flaggedUser.markModified('profile.flags');
    await flaggedUser.save();
    return timestamp;
  }

  notify (flaggedUser, comment) {
    let emailVariables = this.getEmailVariables(flaggedUser);
    emailVariables = emailVariables.concat([
      { name: 'REPORTER_COMMENT', content: comment || '' },
    ]);

    sendTxn(FLAG_REPORT_EMAILS, 'profile-report-to-mods-with-comments', emailVariables);

    slack.sendProfileFlagNotification({
      reporter: this.user,
      flaggedUser,
      comment,
    });
  }

  async flag () {
    const { flaggedUser, comment, source } = await this.validate();
    const timestamp = await this.flagProfile(flaggedUser, comment, source);
    this.notify(flaggedUser, comment, source);
    if (!this.user.hasPermission('moderator')) {
      flaggedUser.profile.flags = {};
      flaggedUser.profile.flags[this.user._id] = {
        comment,
        source,
        timestamp,
      };
    }
    return flaggedUser;
  }
}