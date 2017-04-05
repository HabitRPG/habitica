import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { decrypt } from '../../libs/encryption';
import {
  NotFound,
} from '../../libs/errors';

let api = {};

/**
 * @api {get} /email/unsubscribe Unsubscribe an email or user from email notifications
 * @apiDescription Does not require authentication
 * @apiName UnsubscribeEmail
 * @apiGroup Unsubscribe
 * @apiDescription This is a GET method included in official emails from Habitica that will unsubscribe the user from emails.
 *
 * @apiParam (Query) {String} code An unsubscription code
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
        notEmpty: {errorMessage: res.t('missingUnsubscriptionCode')},
      },
    });
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let data = JSON.parse(decrypt(req.query.code));

    if (data._id) {
      let userUpdated = await User.update(
        {_id: data._id},
        { $set: {'preferences.emailNotifications.unsubscribeFromAll': true}}
      ).exec();

      if (userUpdated.nModified !== 1) throw new NotFound(res.t('userNotFound'));

      res.send(`<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextUsers')}`);
    } else {
      let unsubscribedEmail = await EmailUnsubscription.findOne({email: data.email.toLowerCase()}).exec();
      if (!unsubscribedEmail) await EmailUnsubscription.create({email: data.email.toLowerCase()});

      let okResponse = `<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextOthers')}`;
      res.send(okResponse);
    }
  },
};

module.exports = api;
