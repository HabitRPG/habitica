import _ from 'lodash';
import {
  translations,
  momentLangs,
  availableLanguages,
} from '../../libs/i18n';

const api = {};

function geti18nBrowserScript (language) {
  const langCode = language.code;

  return `(function () {
    if (!window) return;
    window['habitica-i18n'] = ${JSON.stringify({
    availableLanguages,
    language,
    strings: translations[langCode],
    momentLang: momentLangs[langCode],
  })};
  })()`;
}

/**
 * @api {get} /api/v3/i18n/browser-script Returns the i18n JS script.
 * @apiDescription Returns the i18n JS script to make
 * all the i18n strings available in the browser under window.i18n.strings.
 * Does not require authentication.
 * @apiName i18nBrowserScriptGet
 * @apiGroup i18n
 */
api.geti18nBrowserScript = {
  method: 'GET',
  url: '/i18n/browser-script',
  async handler (req, res) {
    const language = _.find(availableLanguages, { code: req.language });

    res.set({
      'Content-Type': 'application/javascript',
    });

    const jsonResString = geti18nBrowserScript(language);
    res.status(200).send(jsonResString);
  },
};

export default api;
