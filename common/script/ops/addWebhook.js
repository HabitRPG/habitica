import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import {
  NotFound,
  BadRequest,
} from '../libs/errors';

module.exports = function(user, req) {
  var wh;
  wh = user.preferences.webhooks;

  if(!validator.isURL(req.body.url)) throw new BadRequest(i18n.t('invalidUrl', req.language));
  if(!validator.isBoolean(req.body.enabled)) throw new BadRequest(i18n.t('invalidEnabled', req.language));

  user.markModified('preferences.webhooks');

  return refPush(wh, {
    url: req.body.url,
    enabled: req.body.enabled,
  });
};
