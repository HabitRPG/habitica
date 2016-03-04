import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { decrypt } from '../../libs/api-v3/encryption';
import {
  NotFound,
} from '../../libs/api-v3/errors';

let api = {};

/**
 * @api {post} /unsubscribe Unsubscribe an email or user from email notifications
 * @apiVersion 3.0.0
 * @apiName UnsubscribeEmail
 * @apiGroup Unsubscribe
 *
 * @apiParam {String} code An unsubscription code
 *
 * @apiSuccess {String} okRes An message stating the user/email unsubscribed successfully
 */
api.unsubscribe = {
  method: 'GET',
  url: '/email/unsubscribe',
  middlewares: [],
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
      );

      if (userUpdated.nModified !== 1) throw new NotFound(res.t('userNotFound'));

      res.send(`<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextUsers')}`);
    } else {
      let unsubscribedEmail = await EmailUnsubscription.findOne({email: data.email});
      let okResponse = `<h1>${res.t('unsubscribedSuccessfully')}</h1> ${res.t('unsubscribedTextOthers')}`;
      if (!unsubscribedEmail) await EmailUnsubscription.create({email: data.email});
      res.send(okResponse);
    }
  },
};

export default api;
