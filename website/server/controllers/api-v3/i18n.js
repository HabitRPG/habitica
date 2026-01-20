import nconf from 'nconf';
import {
  BROWSER_SCRIPT_CACHE_PATH,
  geti18nCoreBrowserScript,
  geti18nContentBrowserScript,
} from '../../libs/i18n';

const IS_PROD = nconf.get('IS_PROD');

const api = {};

/**
 * @api {get} /api/v3/i18n/core Returns the i18n JS script.
 * @apiDescription Returns the i18n JS script to make
 * all the i18n strings available in the browser under window.i18n.strings.
 * Does not require authentication.
 * @apiName i18nBrowserScriptGet
 * @apiGroup i18n
 */
api.geti18nCoreBrowserScript = {
  method: 'GET',
  url: '/i18n/core',
  async handler (req, res) {
    if (IS_PROD) {
      res.set({
        'Cache-Control': 'private',
      });
      res.sendFile(`${BROWSER_SCRIPT_CACHE_PATH}core/${req.language}.js`);
    } else {
      res.set({
        'Content-Type': 'application/javascript',
      });

      const jsonResString = geti18nCoreBrowserScript(req.language);
      res.status(200).send(jsonResString);
    }
  },
};

/**
 * @api {get} /api/v3/i18n/content Returns the i18n JS script.
 * @apiDescription Returns the i18n JS script to make
 * all the i18n strings available in the browser under window.i18n.strings.
 * Does not require authentication.
 * @apiName i18nBrowserScriptGet
 * @apiGroup i18n
 */
api.geti18nContentBrowserScript = {
  method: 'GET',
  url: '/i18n/content',
  async handler (req, res) {
    if (IS_PROD) {
      res.set({
        'Cache-Control': 'private',
      });
      res.sendFile(`${BROWSER_SCRIPT_CACHE_PATH}content/${req.language}.js`);
    } else {
      res.set({
        'Content-Type': 'application/javascript',
      });

      const jsonResString = geti18nContentBrowserScript(req.language);
      res.status(200).send(jsonResString);
    }
  },
};

export default api;
