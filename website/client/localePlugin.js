import fs from 'fs';
import path from 'path';

import { approvedLanguages } from '../common/script/libs/i18n';

const localePath = path.join(__dirname, '../common/locales/');

const translations = {};
const momentLangs = {};

function loadFile (file) {
  const contents = fs.readFileSync(file);
  return JSON.parse(contents); 
}

function _loadTranslations (locale) {
  const files = fs.readdirSync(path.join(localePath, locale));

  translations[locale] = {};

  files.forEach(file => {
    if (path.extname(file) !== '.json') return;

    const t = loadFile(path.join(localePath, locale, file))
    translations[locale] = {
      ...translations[locale],
      ...t,
    }
  });
}

// First fetch English strings so we can merge them with missing strings in other languages
_loadTranslations('en');

// Then load all other languages
approvedLanguages.forEach(file => {
  if (file === 'en' || fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
  _loadTranslations(file);

  // Strip empty strings, then merge missing strings from english
  translations[file] = {
    ...translations.en,
    ...translations[file],
  }
});

export default function localePlugin() {
  const virtualModuleId = 'virtual:translations'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'locale', // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(translations)}`;
      }
    },
  }
}