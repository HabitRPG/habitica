import { model as User } from '../../models/user';
import accepts from 'accepts';
import _ from 'lodash';
import {
  translations,
  defaultLangCodes,
  multipleVersionsLanguages,
} from '../../libs/api-v3/i18n';

function _getFromBrowser (req) {
  let acceptedLanguages = accepts(req).languages();

  let acceptable = _(acceptedLanguages).map((lang) => {
    return lang.slice(0, 2);
  }).uniq().value();

  let matches = _.intersection(acceptable, defaultLangCodes);

  let iAcceptedCompleteLang = matches.length > 0 ? multipleVersionsLanguages.indexOf(matches[0].toLowerCase()) : -1;

  if (iAcceptedCompleteLang !== -1) {
    let acceptedCompleteLang = _.find(acceptedLanguages, (accepted) => {
      return accepted.slice(0, 2) === multipleVersionsLanguages[iAcceptedCompleteLang];
    });

    if (acceptedCompleteLang) {
      acceptedCompleteLang = acceptedCompleteLang.toLowerCase();
    } else {
      return 'en';
    }

    if (matches[0] === 'es') {
      // In case of a Latin American version of Spanish use 'es_419'
      return multipleVersionsLanguages.es.indexOf(acceptedCompleteLang !== -1) ? 'es_419' : 'es';
    } else if (matches[0] === 'zh') {
      let iChinese = multipleVersionsLanguages.zh.indexOf(acceptedCompleteLang.toLowerCase());

      return iChinese !== -1 ? multipleVersionsLanguages.zh[iChinese] : 'zh';
    } else {
      return 'en';
    }
  } else if (matches.length > 0) {
    return matches[0].toLowerCase();
  } else {
    return 'en';
  }
}

function _getFromUser (user, req) {
  let lang;

  if (user && user.preferences.language && translations[user.preferences.language]) {
    lang = user.preferences.language;
  } else {
    let preferred = _getFromBrowser(req);

    lang = translations[preferred] ? preferred : 'en';
  }

  return lang;
}

export default function getUserLanguage (req, res, next) {
  if (req.query.lang) { // In case the language is specified in the request url, use it
    req.language = translations[req.query.lang] ? req.query.lang : 'en';
    return next();
  } else if (req.locals && req.locals.user) { // If the request is authenticated, use the user's preferred language
    req.language = _getFromUser(req.locals.user, req);
    return next();
  } else if (req.session && req.session.userId) { // Same thing if the user has a valid session
    User
    .findOne({
      _id: req.session.userId,
    }, 'preferences.language')
    .exec()
    .then((user) => {
      req.language = _getFromUser(user, req);
      return next();
    })
    .catch(next);
  } else { // Otherwise get from browser
    req.language = _getFromUser(null, req);
    return next();
  }
}
