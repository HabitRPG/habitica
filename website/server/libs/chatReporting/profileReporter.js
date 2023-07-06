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
    this.req.checkParams('memberId', apiError('memberIdRequired')).notEmpty();

    const validationErrors = this.req.validationErrors();
    if (validationErrors) throw validationErrors;

    const flaggedUser = await User.findOne(
      { _id: this.req.query.memberId },
      { auth: 1, profile: 1 },
    ).exec();
    if (!flaggedUser) {
      throw new NotFound(this.res.t('userWithIDNotFound'));
    }

    if (flaggedUser.profile.flags.indexOf(this.user._id) !== -1 && !this.user.hasPermission('moderator')) {
      throw new BadRequest('A profile can not be flagged more than once by the same user.');
    }

    const userComment = this.req.body.comment;

    return { flaggedUser, userComment };
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

  async notify (flaggedUser, userComment) {
    let emailVariables = await this.getEmailVariables(flaggedUser);
    emailVariables = emailVariables.concat([
      { name: 'REPORTER_COMMENT', content: userComment || '' },
    ]);

    sendTxn(FLAG_REPORT_EMAILS, 'profile-report-to-mods-with-comments', emailVariables);

    slack.sendProfileFlagNotification({
      reporter: this.user,
      flaggedUser,
      userComment,
    });
  }
}