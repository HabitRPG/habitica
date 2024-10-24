import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { decrypt } from '../../libs/encryption';
import {
  NotFound,
} from '../../libs/errors';

const api = {};

async function emailUnsubscribe (req, res) {
  req.checkQuery({
    code: {
      notEmpty: { errorMessage: res.t('missingUnsubscriptionCode') },
    },
  });
  const validationErrors = req.validationErrors();
  if (validationErrors) throw validationErrors;

  const data = JSON.parse(decrypt(req.query.code));

  if (data._id) {
    const userUpdated = await User.updateOne(
      { _id: data._id },
      { $set: { 'preferences.emailNotifications.unsubscribeFromAll': true } },
    ).exec();

    if (userUpdated.modifiedCount !== 1) throw new NotFound(res.t('userNotFound'));

    res.send(`<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextUsers')}`);
  } else {
    const unsubscribedEmail = await EmailUnsubscription
      .findOne({ email: data.email.toLowerCase() }).exec();
    if (!unsubscribedEmail) await EmailUnsubscription.create({ email: data.email.toLowerCase() });

    const okResponse = `<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextOthers')}`;
    res.send(okResponse);
  }
}

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
    await emailUnsubscribe(req, res);
  },
};

/**
 * @api {post} /email/unsubscribe Unsubscribe an email address or user from email notifications
 * @apiName OneClickUnsubscribe
 * @apiGroup Unsubscribe
 * @apiDescription This is a POST method for compliance with RFC 8058. It works identically to the
 * GET method on the same URI, allowing the user to unsubscribe from emails either via visiting a
 * hyperlink or activating a one-click Unsubscribe button in their email client.
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
api.oneClickUnsubscribe = {
  method: 'POST',
  url: '/email/unsubscribe',
  async handler (req, res) {
    await emailUnsubscribe(req, res);
  },
};

export default api;
