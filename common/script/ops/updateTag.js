import i18n from '../i18n';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function(user, req, cb) {
  var i, tid;
  tid = req.params.id;
  i = _.findIndex(user.tags, {
    id: tid
  });
  if (!~i) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTagNotFound', req.language)
    }) : void 0;
  }
  user.tags[i].name = req.body.name;
  return typeof cb === "function" ? cb(null, user.tags[i]) : void 0;
};
