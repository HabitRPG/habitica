import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { decrypt } from '../../libs/encryption';
import {
  NotFound,
} from '../../libs/errors';

const api = {};

/**
 * @api {get} /email/unsubscribe Unsubscribe an email address or user from email notifications
 * @apiName UnsubscribeEmail
 * @apiGroup Unsubscribe
 * @apiDescription This is a GET method included in official emails from Habitica
 * that will unsubscribe the user from emails.
 * Does not require authentication.
 *
 * @apiParam (Query) {String} code An unsubscription code that contains an encrypted User ID or
 * email address
 *
 * @apiSuccess {String} Webpage An html success message
 *
 * @apiError (400) {BadRequest} missingUnsubscriptionCode The unsubscription code is missing.
 * @apiUse UserNotFound
 */
api.unsubscribe = {
  method: 'GET',
  url: '/email/unsubscribe',
  async handler (req, res) {
    req.checkQuery({
      code: {
        notEmpty: { errorMessage: res.t('missingUnsubscriptionCode') },
      },
    });
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const data = JSON.parse(decrypt(req.query.code));

    if (data._id) {
      const userUpdated = await User.update(
        { _id: data._id },
        { $set: { 'preferences.emailNotifications.unsubscribeFromAll': true } },
      ).exec();

      if (userUpdated.nModified !== 1) throw new NotFound(res.t('userNotFound'));

      res.send(`<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextUsers')}`);
    } else {
      const unsubscribedEmail = await EmailUnsubscription
        .findOne({ email: data.email.toLowerCase() }).exec();
      if (!unsubscribedEmail) await EmailUnsubscription.create({ email: data.email.toLowerCase() });

      const okResponse = `<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextOthers')}`;
      res.send(okResponse);
    }
  },
};

export default api;
