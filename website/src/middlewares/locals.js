var nconf = require('nconf');
var _ = require('lodash');
var utils = require('../libs/utils');
var shared = require('../../../common');
var i18n = require('../libs/i18n');
var buildManifest = require('../libs/buildManifest');
var shared = require('../../../common');
var forceRefresh = require('./forceRefresh');
var tavernQuest = require('../models/group').tavernQuest;
var mods = require('../models/user').mods;

// TODO Remove once v3 maintenance is done
const MAINTENANCE_START = nconf.get('MAINTENANCE_START');
const MAINTENANCE_END = nconf.get('MAINTENANCE_END');

// To avoid stringifying more data then we need,
// items from `env` used on the client will have to be specified in this array
var clientVars = ['language', 'isStaticPage', 'avalaibleLanguages', 'translations',
                  'FACEBOOK_KEY', 'NODE_ENV', 'BASE_URL', 'GA_ID',
                  'AMAZON_PAYMENTS', 'STRIPE_PUB_KEY', 'AMPLITUDE_KEY',
                  'worldDmg', 'mods', 'IS_MOBILE'];

var env = {
  getManifestFiles: buildManifest.getManifestFiles,
  getBuildUrl: buildManifest.getBuildUrl,
  _: _,
  clientVars: clientVars,
  mods: mods,
  Content: shared.content,
  siteVersion: forceRefresh.siteVersion,
  avalaibleLanguages: i18n.avalaibleLanguages,
  AMAZON_PAYMENTS: {
    SELLER_ID: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
    CLIENT_ID: nconf.get('AMAZON_PAYMENTS:CLIENT_ID')
  }
};

'NODE_ENV BASE_URL GA_ID STRIPE_PUB_KEY FACEBOOK_KEY AMPLITUDE_KEY'.split(' ').forEach(function(key){
  env[key] = nconf.get(key);
});

module.exports = function(req, res, next) {
  var language = _.find(i18n.avalaibleLanguages, {code: req.language});
  var isStaticPage = req.url.split('/')[1] === 'static'; // If url contains '/static/'

  // Load moment.js language file only when not on static pages
  language.momentLang = ((!isStaticPage && i18n.momentLangs[language.code]) || undefined);

  res.locals.habitrpg = _.assign(env, {
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    language: language,
    isStaticPage: isStaticPage,
    translations: i18n.translations[language.code],
    t: function(){ // stringName and vars are the allowed parameters
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(language.code);
      return shared.i18n.t.apply(null, args);
    },
    // Defined here and not outside of the middleware because tavernQuest might be an
    // empty object until the query to fetch it finishes
    worldDmg: (tavernQuest && tavernQuest.extra && tavernQuest.extra.worldDmg) || {},
    // TODO Remove once v3 maintenance is done
    maintenanceStart: MAINTENANCE_START,
    maintenanceEnd: MAINTENANCE_END,
  });

  // Put query-string party (& guild but use partyInvite for backward compatibility)
  // invitations into session to be handled later
  // TODO once we have proper logging in place, log errors here
  if(req.query.partyInvite){
    try{
      req.session.partyInvite = JSON.parse(utils.decrypt(req.query.partyInvite));
    } catch(e){}
  }

  next();
};
