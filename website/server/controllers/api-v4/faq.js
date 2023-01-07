import _ from 'lodash';
import { langCodes } from '../../libs/i18n';
import apiError from '../../libs/apiError';
import common from '../../../common';
import { localizeContentData } from '../../libs/content';

const { content } = common;
const { faq } = content;

const api = {};

function _deleteProperties (obj, keysToDelete, platform) {
  // if there is no description for specified platform, use 'web' description by default
  if (obj[platform] === undefined) {
    delete obj.ios;
    delete obj.android;
    return;
  }

  keysToDelete.forEach(key => delete obj[key]);
}

function _deleteOtherPlatformsAnswers (faqObject, platform) {
  const faqCopy = _.cloneDeep(faqObject);
  _.remove(faqCopy.questions, question => question.exclusions.indexOf(platform) !== -1);
  const keysToDelete = _.without(['web', 'ios', 'android'], platform);

  _deleteProperties(faqCopy.stillNeedHelp, keysToDelete, platform);
  faqCopy.questions.forEach(question => {
    _deleteProperties(question, keysToDelete, platform);
  });

  return faqCopy;
}

/**
 * @apiIgnore
 * @api {get} /api/v4/faq Get faq in json format
 * @apiDescription Does not require authentication.
 * @apiName FaqGet
 * @apiGroup Content
 *
 * @apiParam (Query) {String="bg","cs","da","de",
 *                   "en","en@pirate","en_GB",
 *                    "es","es_419","fr","he","hu",
 *                    "id","it","ja","nl","pl","pt","pt_BR",
 *                    "ro","ru","sk","sr","sv",
 *                    "uk","zh","zh_TW"} [language=en] Language code used for the items'
 *                                                     strings. If the authenticated user makes
 *                                                     the request, the content will return with
 *                                                     the user's configured language.
 *
 *
 * @apiSuccess {Object} data FAQ in a json format
 */
api.faq = {
  method: 'GET',
  url: '/faq',
  async handler (req, res) {
    req.checkQuery('platform').optional().isIn(['web', 'android', 'ios'], apiError('guildsPaginateBooleanString'));

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const proposedLang = req.query.language && req.query.language.toString();
    const language = langCodes.includes(proposedLang) ? proposedLang : 'en';

    const { platform } = req.query;

    const dataToLocalize = platform ? _deleteOtherPlatformsAnswers(faq, platform) : faq;
    res.respond(200, localizeContentData(dataToLocalize, language));
  },
};

export default api;
