import * as i18n from '../../libs/i18n';

const api = {};

/**
 * @api {get} /api/v3/i18n/browser-script Returns a JS script to make all the i18n strings available in the browser
 * under window.i18n.strings
 * @apiDescription Does not require authentication.
 * @apiName i18nBrowserScriptGet
 * @apiGroup i18n
 */
api.geti18nBrowserScript = {
  method: 'GET',
  url: '/i18n/browser-script',
  async handler (req, res) {
    res.set({
      'Content-Type': 'application/javascript',
    });

    const jsonResString = `window.i18n = {strings: ${JSON.stringify(i18n.translations[req.language])}}`;
    res.status(200).send(jsonResString);
  },
};

module.exports = api;
