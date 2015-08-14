var nconf = require('nconf');
var _ = require('lodash');
var utils = require('../utils');
var shared = require('../../../common');
var i18n = require('../i18n.js');
var buildManifest = require('../libs/buildManifest');
var shared = require('../../../common');
var forceRefresh = require('./forceRefresh');

module.exports = function(req, res, next) {
  var language = _.find(i18n.avalaibleLanguages, {code: req.language});
  var isStaticPage = req.url.split('/')[1] === 'static'; // If url contains '/static/'

  // Load moment.js language file only when not on static pages
  language.momentLang = ((!isStaticPage && i18n.momentLangs[language.code]) || undefined);

  var tavern = require('../models/group').tavern;
  var envVars = _.pick(nconf.get(), 'NODE_ENV BASE_URL GA_ID STRIPE_PUB_KEY FACEBOOK_KEY AMPLITUDE_KEY'.split(' '));
  res.locals.habitrpg = _.merge(envVars, {
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    getManifestFiles: buildManifest.getManifestFiles,
    getBuildUrl: buildManifest.getBuildUrl,
    avalaibleLanguages: i18n.avalaibleLanguages,
    language: language,
    isStaticPage: isStaticPage,
    translations: i18n.translations[language.code],
    t: function(){ // stringName and vars are the allowed parameters
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(language.code);
      return shared.i18n.t.apply(null, args);
    },
    siteVersion: forceRefresh.siteVersion,
    Content: shared.content,
    mods: require('../models/user').mods,
    tavern: tavern, // for world boss
    worldDmg: (tavern && tavern.quest && tavern.quest.extra && tavern.quest.extra.worldDmg) || {},
    _: _,
    AMAZON_PAYMENTS: {
      SELLER_ID: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
      CLIENT_ID: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
    }
  });

  // Put query-string party (& guild but use partyInvite for backward compatibility)
  // invitations into session to be handled later
  try{
    req.session.partyInvite = JSON.parse(utils.decrypt(req.query.partyInvite))
  } catch(e){}

  next();
}
