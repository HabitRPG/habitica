import common from '../../../common';
import _ from 'lodash';
import {
  model as Group,
  TAVERN_ID as tavernId,
} from '../../models/group';
import {
  getCachedResponse,
  saveResponseToDisk,
} from '../../libs/cachedResponse';
import { langCodes } from '../../libs/i18n';

const RESPONSE_NAME = 'world_state';

let api = {};

function getSpecialItems () {
  return _(common.content.hatchingPotions)
    .values()
    .filter(hp => hp.limited && hp.canBuy())
    .map(premiumHatchingPotion => {
      return {
        key: premiumHatchingPotion.key,
        type: 'hatchingPotions',
      };
    }).value();
}

function getNextEvent () {
  let nextEvent = common.content.getNextEvent();
  nextEvent.specialItems = getSpecialItems();
  return nextEvent;
}

async function getWorldBoss () {
  let tavern = await Group
    .findById(tavernId)
    .select('quest.progress quest.key quest.active')
    .exec();
  let quest;
  if (tavern) {
    if (tavern.quest.active) {
      quest = tavern.quest;
    }
  }
  return quest;
}

/**
 * @api {get} /api/v3/world-state Get the state for the game world
 * @apiDescription Does not require authentication.
 * @apiName WorldStateGet
 * @apiGroup WorldState
 *
 * @apiParam {String="bg","cs","da","de","en","en@pirate","en_GB","es","es_419","fr","he","hu","id","it","ja","nl","pl","pt","pt_BR","ro","ru","sk","sr","sv","uk","zh","zh_TW"} [language=en]  Query parameter, the  language code used for the items' strings. If the authenticated user makes the request, the content will return with the user's configured language.
 *
 * @apiSuccess {Object} data Various data about the state of the land Habitica.

 *
 */
api.getWorldState = {
  method: 'GET',
  url: '/world-state',
  async handler (req, res) {
    let language = 'en';
    let proposedLang = req.query.language && req.query.language.toString();

    if (langCodes.indexOf(proposedLang) > -1) {
      language = proposedLang;
    }

    let worldState = await getCachedResponse(RESPONSE_NAME, language);

    if (!worldState) { // If there is no cached response, generate it.
      worldState = {};
      worldState.event = getNextEvent();
      worldState.worldboss = await getWorldBoss();
      worldState = JSON.stringify(worldState);
    }

    res.set({
      'Content-Type': 'application/json',
    });

    let jsonResString = `{"success": true, "data": ${worldState}}`;
    res.status(200).send(jsonResString);

    saveResponseToDisk(RESPONSE_NAME, language, worldState);
  },
};

module.exports = api;
