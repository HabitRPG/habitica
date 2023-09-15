import { model as User } from '../../models/user';
import * as slack from '../slack';

import ChatReporter from './chatReporter';
import {
  BadRequest,
  NotFound,
} from '../errors';

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

  notify (flaggedUser, comment, source) {
    slack.sendProfileFlagNotification({
      reporter: this.user,
      flaggedUser,
      userComment: comment,
      source,
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
