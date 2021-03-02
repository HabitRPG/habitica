import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import shared from '../../common';

export const localePath = path.join(__dirname, '../../common/locales/');
export const BROWSER_SCRIPT_CACHE_PATH = path.join(__dirname, '/../../../i18n_cache/');

// Store translations
export const translations = {};
// Store MomentJS localization files
export const momentLangs = {};

// Handle differences in language codes between MomentJS and /locales
const momentLangsMapping = {
  en: 'en-gb',
  en_GB: 'en-gb', // eslint-disable-line camelcase
  no: 'nn',
  zh: 'zh-cn',
  zh_TW: 'zh-tw', // eslint-disable-line camelcase
  es_419: 'es', // eslint-disable-line camelcase
  pt_BR: 'pt-br', // eslint-disable-line camelcase
};

export const approvedLanguages = [
  'bg', 'cs', 'da', 'de', 'en', 'en_GB', 'en@pirate',
  'es', 'es_419', 'fr', 'he', 'hu', 'id', 'it',
  'ja', 'nl', 'pl', 'pt', 'pt_BR', 'ro', 'ru', 'sk',
  'sr', 'sv', 'tr', 'uk', 'zh', 'zh_TW',
];

function _loadTranslations (locale) {
  const files = fs.readdirSync(path.join(localePath, locale));

  translations[locale] = {};

  files.forEach(file => {
    if (path.extname(file) !== '.json') return;

    // We use require to load and parse a JSON file
    _.merge(translations[locale], require(path.join(localePath, locale, file))); // eslint-disable-line global-require, import/no-dynamic-require, max-len
  });
}

// First fetch English strings so we can merge them with missing strings in other languages
_loadTranslations('en');

// Then load all other languages
approvedLanguages.forEach(file => {
  if (file === 'en' || fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
  _loadTranslations(file);

  // Merge missing strings from english
  _.defaults(translations[file], translations.en);
});

// Add translations to shared
shared.i18n.translations = translations;

export const langCodes = Object.keys(translations);

export const availableLanguages = langCodes.map(langCode => ({
  code: langCode,
  name: translations[langCode].languageName,
}));

langCodes.forEach(code => {
  const lang = _.find(availableLanguages, { code });

  lang.momentLangCode = momentLangsMapping[code] || code;

  try {
    // MomentJS lang files are JS files that has to be executed
    // in the browser so we load them as plain text files
    // We wrap everything in a try catch because the file might not exist
    const f = fs.readFileSync(path.join(__dirname, `/../../../node_modules/moment/locale/${lang.momentLangCode}.js`), 'utf8');

    momentLangs[code] = f;
  } catch (e) { // eslint-disable-lint no-empty
    // The catch block is mandatory so it won't crash the server
  }
});

// Remove en_GB from langCodes checked by browser to avoid it being
// used in place of plain original 'en'
// (it's an optional language that can be enabled only in setting)
export const defaultLangCodes = _.without(langCodes, 'en_GB');

// A map of languages that have different versions and the relative versions
export const multipleVersionsLanguages = {
  es: {
    'es-419': 'es_419',
    'es-mx': 'es_419',
    'es-gt': 'es_419',
    'es-cr': 'es_419',
    'es-pa': 'es_419',
    'es-do': 'es_419',
    'es-ve': 'es_419',
    'es-co': 'es_419',
    'es-pe': 'es_419',
    'es-ar': 'es_419',
    'es-ec': 'es_419',
    'es-cl': 'es_419',
    'es-uy': 'es_419',
    'es-py': 'es_419',
    'es-bo': 'es_419',
    'es-sv': 'es_419',
    'es-hn': 'es_419',
    'es-ni': 'es_419',
    'es-pr': 'es_419',
  },
  zh: {
    'zh-tw': 'zh_TW',
  },
  pt: {
    'pt-br': 'pt_BR',
  },
};

export function geti18nBrowserScript (languageCode) {
  const language = _.find(availableLanguages, { code: languageCode });

  return `(function () {
    if (!window) return;
    window['habitica-i18n'] = ${JSON.stringify({
    availableLanguages,
    language,
    strings: translations[languageCode],
    momentLang: momentLangs[languageCode],
  })};
  })()`;
}
