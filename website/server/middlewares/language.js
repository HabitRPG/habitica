import { model as User } from '../models/user';
import common from '../../common';
import {
  translations,
} from '../libs/i18n';
import {
  getLanguageFromUser,
  getLanguageFromBrowser,
} from '../libs/language';

const { i18n } = common;

export function attachTranslateFunction (req, res, next) {
  res.t = function reqTranslation (...args) {
    return i18n.t(...args, req.language);
  };

  next();
}

export function getUserLanguage (req, res, next) {
  // In case the language is specified in the request url, use intersection
  if (req.query.lang) {
    req.language = translations[req.query.lang] ? req.query.lang : 'en';
    return next();
  }

  // If the request is authenticated, use the user's preferred language
  if (res.locals && res.locals.user) {
    req.language = getLanguageFromUser(res.locals.user, req);
    return next();
  }

  // Same thing if the user has a valid session
  if (req.session && req.session.userId) {
    return User.findOne({
      _id: req.session.userId,
    }, 'preferences.language')
      .lean()
      .exec()
      .then(user => {
        req.language = getLanguageFromUser(user, req);
        return next();
      })
      .catch(next);
  }

  // Otherwise get from browser
  req.language = getLanguageFromBrowser(req);
  return next();
}
