import nconf from 'nconf';
import _ from 'lodash';
import shared from '../../../../common';
import * as i18n from '../../libs/api-v3/i18n';
import {
  getBuildUrl,
  getManifestFiles,
} from '../../libs/api-v3/buildManifest';
import forceRefresh from './../forceRefresh';
import { tavernQuest } from '../../models/group';
import { mods } from '../../models/user';

// To avoid stringifying more data then we need,
// items from `env` used on the client will have to be specified in this array
const CLIENT_VARS = ['language', 'isStaticPage', 'availableLanguages', 'translations',
                  'FACEBOOK_KEY', 'NODE_ENV', 'BASE_URL', 'GA_ID',
                  'AMAZON_PAYMENTS', 'STRIPE_PUB_KEY', 'AMPLITUDE_KEY',
                  'worldDmg', 'mods', 'IS_MOBILE', 'PUSHER'];

let env = {
  getManifestFiles,
  getBuildUrl,
  _,
  clientVars: CLIENT_VARS,
  mods,
  Content: shared.content,
  siteVersion: forceRefresh.siteVersion,
  availableLanguages: i18n.availableLanguages,
  AMAZON_PAYMENTS: {
    SELLER_ID: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
    CLIENT_ID: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
  },
  PUSHER: {
    KEY: nconf.get('PUSHER:KEY'),
    ENABLED: nconf.get('PUSHER:ENABLED'),
  },
};

'NODE_ENV BASE_URL GA_ID STRIPE_PUB_KEY FACEBOOK_KEY AMPLITUDE_KEY'.split(' ').forEach(key => {
  env[key] = nconf.get(key);
});

module.exports = function locals (req, res, next) {
  let language = _.find(i18n.availableLanguages, {code: req.language});
  let isStaticPage = req.url.split('/')[1] === 'static'; // If url contains '/static/'

  // Load moment.js language file only when not on static pages
  language.momentLang = !isStaticPage && i18n.momentLangs[language.code] || undefined;

  res.locals.habitrpg = _.assign(env, {
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    language,
    isStaticPage,
    translations: i18n.translations[language.code],
    t (...args) { // stringName and vars are the allowed parameters
      args.push(language.code);
      return shared.i18n.t(...args);
    },
    // Defined here and not outside of the middleware because tavernQuest might be an
    // empty object until the query to fetch it finishes
    worldDmg: tavernQuest && tavernQuest.extra && tavernQuest.extra.worldDmg || {},
  });

  next();
};
