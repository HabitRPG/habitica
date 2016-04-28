import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb, analytics) {
  var alreadyOwns, analyticsData, cost, fullSet, k, path, split, v;
  path = req.query.path;
  fullSet = ~path.indexOf(",");
  cost = ~path.indexOf('background.') ? fullSet ? 3.75 : 1.75 : fullSet ? 1.25 : 0.5;
  alreadyOwns = !fullSet && user.fns.dotGet("purchased." + path) === true;
  if ((user.balance < cost || !user.balance) && !alreadyOwns) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language)
    }) : void 0;
  }
  if (fullSet) {
    _.each(path.split(","), function(p) {
      if (~path.indexOf('gear.')) {
        user.fns.dotSet("" + p, true);
        true;
      } else {

      }
      user.fns.dotSet("purchased." + p, true);
      return true;
    });
  } else {
    if (alreadyOwns) {
      split = path.split('.');
      v = split.pop();
      k = split.join('.');
      if (k === 'background' && v === user.preferences.background) {
        v = '';
      }
      user.fns.dotSet("preferences." + k, v);
      return typeof cb === "function" ? cb(null, req) : void 0;
    }
    user.fns.dotSet("purchased." + path, true);
  }
  user.balance -= cost;
  if (~path.indexOf('gear.')) {
    if (typeof user.markModified === "function") {
      user.markModified('gear.owned');
    }
  } else {
    if (typeof user.markModified === "function") {
      user.markModified('purchased');
    }
  }
  analyticsData = {
    uuid: user._id,
    itemKey: path,
    itemType: 'customization',
    acquireMethod: 'Gems',
    gemCost: cost / .25,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('acquire item', analyticsData);
  }
  return typeof cb === "function" ? cb(null, _.pick(user, splitWhitespace('purchased preferences items'))) : void 0;
};
