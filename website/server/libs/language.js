import accepts from 'accepts';
import _ from 'lodash';
import {
  translations,
  defaultLangCodes,
  multipleVersionsLanguages,
} from './i18n';

function getUniqueListOfLanguages (languages) {
  const acceptableLanguages = _(languages).map(lang => lang.slice(0, 2)).uniq().value();

  const uniqueListOfLanguages = _.intersection(acceptableLanguages, defaultLangCodes);

  return uniqueListOfLanguages;
}

function checkForApplicableLanguageVariant (originalLanguageOptions) {
  const languageVariant = _.find(originalLanguageOptions, accepted => {
    const trimmedAccepted = accepted.slice(0, 2);

    return multipleVersionsLanguages[trimmedAccepted];
  });

  return languageVariant;
}

export function getLanguageFromBrowser (req) {
  const originalLanguageOptions = accepts(req).languages();
  const uniqueListOfLanguages = getUniqueListOfLanguages(originalLanguageOptions);
  const baseLanguage = (uniqueListOfLanguages[0] || '').toLowerCase();
  const languageMapping = multipleVersionsLanguages[baseLanguage];

  if (languageMapping) {
    let languageVariant = checkForApplicableLanguageVariant(originalLanguageOptions);

    if (languageVariant) {
      languageVariant = languageVariant.toLowerCase();
    } else {
      return 'en';
    }

    return languageMapping[languageVariant] || baseLanguage;
  }
  return baseLanguage || 'en';
}

export function getLanguageFromUser (user, req) {
  const preferredLang = user && user.preferences && user.preferences.language;
  const lang = translations[preferredLang] ? preferredLang : getLanguageFromBrowser(req);

  return lang;
}
