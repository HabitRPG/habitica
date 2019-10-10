import accepts from 'accepts';
import _ from 'lodash';
import { model as User } from '../models/user';
import common from '../../common';
import {
  translations,
  defaultLangCodes,
  multipleVersionsLanguages,
} from '../libs/i18n';

const { i18n } = common;

function _getUniqueListOfLanguages (languages) {
  const acceptableLanguages = _(languages).map(lang => lang.slice(0, 2)).uniq().value();

  const uniqueListOfLanguages = _.intersection(acceptableLanguages, defaultLangCodes);

  return uniqueListOfLanguages;
}

function _checkForApplicableLanguageVariant (originalLanguageOptions) {
  const languageVariant = _.find(originalLanguageOptions, accepted => {
    const trimmedAccepted = accepted.slice(0, 2);

    return multipleVersionsLanguages[trimmedAccepted];
  });

  return languageVariant;
}

function _getFromBrowser (req) {
  const originalLanguageOptions = accepts(req).languages();
  const uniqueListOfLanguages = _getUniqueListOfLanguages(originalLanguageOptions);
  const baseLanguage = (uniqueListOfLanguages[0] || '').toLowerCase();
  const languageMapping = multipleVersionsLanguages[baseLanguage];

  if (languageMapping) {
    let languageVariant = _checkForApplicableLanguageVariant(originalLanguageOptions);

    if (languageVariant) {
      languageVariant = languageVariant.toLowerCase();
    } else {
      return 'en';
    }

    return languageMapping[languageVariant] || baseLanguage;
  }
  return baseLanguage || 'en';
}

function _getFromUser (user, req) {
  const preferredLang = user && user.preferences && user.preferences.language;
  const lang = translations[preferredLang] ? preferredLang : _getFromBrowser(req);

  return lang;
}

export function attachTranslateFunction (req, res, next) {
  res.t = function reqTranslation (...args) {
    return i18n.t(...args, req.language);
  };

  next();
}

export function getUserLanguage (req, res, next) {
  if (req.query.lang) { // In case the language is specified in the request url, use it
    req.language = translations[req.query.lang] ? req.query.lang : 'en';
    return next();

  // If the request is authenticated, use the user's preferred language
  } if (req.locals && req.locals.user) {
    req.language = _getFromUser(req.locals.user, req);
    return next();
  } if (req.session && req.session.userId) { // Same thing if the user has a valid session
    return User.findOne({
      _id: req.session.userId,
    }, 'preferences.language')
      .lean()
      .exec()
      .then(user => {
        req.language = _getFromUser(user, req);
        return next();
      })
      .catch(next);
  } // Otherwise get from browser
  req.language = _getFromUser(null, req);
  return next();
}
