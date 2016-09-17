import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import shared from '../../common';

export const localePath = path.join(__dirname, '../../common/locales/');

// Store translations
export let translations = {};
// Store MomentJS localization files
export let momentLangs = {};

// Handle differencies in language codes between MomentJS and /locales
let momentLangsMapping = {
  en: 'en-gb',
  en_GB: 'en-gb', // eslint-disable-line camelcase
  no: 'nn',
  zh: 'zh-cn',
  es_419: 'es', // eslint-disable-line camelcase
  pt_BR: 'pt-br', // eslint-disable-line camelcase
};

function _loadTranslations (locale) {
  let files = fs.readdirSync(path.join(localePath, locale));

  translations[locale] = {};

  files.forEach((file) => {
    if (path.extname(file) !== '.json') return;

    // We use require to load and parse a JSON file
    _.merge(translations[locale], require(path.join(localePath, locale, file))); // eslint-disable-line global-require
  });
}

// First fetch English strings so we can merge them with missing strings in other languages
_loadTranslations('en');

// Then load all other languages
fs.readdirSync(localePath).forEach((file) => {
  if (file === 'en' || fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
  _loadTranslations(file);

  // Merge missing strings from english
  _.defaults(translations[file], translations.en);
});

// Add translations to shared
shared.i18n.translations = translations;

export let langCodes = Object.keys(translations);

export let availableLanguages = langCodes.map((langCode) => {
  return {
    code: langCode,
    name: translations[langCode].languageName,
  };
});

langCodes.forEach((code) => {
  let lang = _.find(availableLanguages, {code});

  lang.momentLangCode = momentLangsMapping[code] || code;

  try {
    // MomentJS lang files are JS files that has to be executed in the browser so we load them as plain text files
    // We wrap everything in a try catch because the file might not exist
    let f = fs.readFileSync(path.join(__dirname, `/../../../node_modules/moment/locale/${lang.momentLangCode}.js`), 'utf8');

    momentLangs[code] = f;
  } catch (e) { // eslint-disable-lint no-empty
    // The catch block is mandatory so it won't crash the server
  }
});

// Remove en_GB from langCodes checked by browser to avoid it being
// used in place of plain original 'en' (it's an optional language that can be enabled only in setting)
export let defaultLangCodes = _.without(langCodes, 'en_GB');

// A map of languages that have different versions and the relative versions
export let multipleVersionsLanguages = {
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
