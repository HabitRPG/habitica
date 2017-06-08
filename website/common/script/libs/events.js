import values from 'lodash/values';
import map from 'lodash/map';
import {
  EVENTS,
  hatchingPotions,
} from '../content';

function getSpecialItems () {
  let specialItems;
  specialItems = values(hatchingPotions);
  specialItems = specialItems.filter(hp => hp.limited && hp.canBuy());
  specialItems = map(specialItems, premiumHatchingPotion => {
    return {
      key: premiumHatchingPotion.key,
      type: 'hatchingPotions',
    };
  }).value();
  return specialItems;
}

function getNextEvent () {
  let nextEvent;
  let today = new Date().toISOString();
  for (let eventKey in EVENTS) {
    let seasonalEvent = EVENTS[eventKey];
    if (seasonalEvent.end > today) {
      if (!nextEvent || seasonalEvent.end > nextEvent.end) {
        seasonalEvent.key = eventKey;
        nextEvent = seasonalEvent;
      }
    }
  }
  nextEvent.specialItems = getSpecialItems();
  return nextEvent;
}

module.exports = getNextEvent;
