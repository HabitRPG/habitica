import nconf from 'nconf';
import { langCodes } from '../../libs/i18n';
import { CONTENT_CACHE_PATH, getLocalizedContentResponse } from '../../libs/content';

const IS_PROD = nconf.get('IS_PROD');

const api = {};

/**
 * @api {get} /api/v3/content Get all available content objects
 * @apiDescription Does not require authentication.
 * @apiName ContentGet
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
 * @apiSuccess {Object} data Various data about the content of Habitica. The content route
 * contains many keys, but the data listed below are the recommended data to use.
 * @apiSuccess {Object} data.mystery The mystery sets awarded to paying subscribers.
 * @apiSuccess {Object} data.gear The gear that can be equipped.
 * @apiSuccess {Object} data.gear.tree Detailed information about the gear, organized by type.
 * @apiSuccess {Object} data.gear.flat The full key of each equipment.
 * @apiSuccess {Object} data.spells The skills organized by class. Includes cards and visual buffs.
 * @apiSuccess {Object} data.potion Data about the health potion.
 * @apiSuccess {Object} data.armoire Data about the armoire.
 * @apiSuccess {Array} data.classes The available classes.
 * @apiSuccess {Object} data.eggs All available eggs.
 * @apiSuccess {Object} data.timeTravelStable The animals available
 *                                            in the Time Traveler's stable, separated
 *                                            into pets and mounts.
 * @apiSuccess {Object} data.hatchingPotions All the hatching potions.
 * @apiSuccess {Object} data.petInfo All the pets with extra info.
 * @apiSuccess {Object} data.mountInfo All the mounts with extra info.
 * @apiSuccess {Object} data.food All the food.
 * @apiSuccess {Array} data.userCanOwnQuestCategories The types of quests that a user can own.
 * @apiSuccess {Object} data.quests Data about the quests.
 * @apiSuccess {Object} data.appearances Data about the appearance properties.
 * @apiSuccess {Object} data.appearances.hair Data about available hair options.
 * @apiSuccess {Object} data.appearances.shirt Data about available shirt options.
 * @apiSuccess {Object} data.appearances.size Data about available body size options.
 * @apiSuccess {Object} data.appearances.skin Data about available skin options.
 * @apiSuccess {Object} data.appearances.chair Data about available chair options.
 * @apiSuccess {Object} data.appearances.background Data about available background options.
 * @apiSuccess {Object} data.backgrounds Data about the background sets.
 * @apiSuccess {Object} data.subscriptionBlocks Data about the various subscriptions blocks.
 *
 */
api.getContent = {
  method: 'GET',
  url: '/content',
  noLanguage: true,
  async handler (req, res) {
    let language = 'en';
    const proposedLang = req.query.language;

    if (proposedLang && langCodes.includes(proposedLang)) {
      language = proposedLang;
    }

    if (IS_PROD) {
      res.sendFile(`${CONTENT_CACHE_PATH}${language}.json`);
    } else {
      res.set({
        'Content-Type': 'application/json',
      });

      const jsonResString = getLocalizedContentResponse(language);
      res.status(200).send(jsonResString);
    }
  },
};

export default api;
