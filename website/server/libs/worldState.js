import filter from 'lodash/filter';
import moment from 'moment';
import { // eslint-disable-line import/no-cycle
  model as Group,
  TAVERN_ID as tavernId,
} from '../models/group';
import common from '../../common';

export async function getWorldBoss () {
  const tavern = await Group
    .findById(tavernId)
    .select('quest.progress quest.key quest.active quest.extra')
    .exec();
  if (tavern && tavern.quest && tavern.quest.active) {
    return tavern.quest;
  }
  return {};
}

export function getCurrentEvent () {
  const currEvtKey = Object.keys(common.content.events).find(evtKey => {
    const event = common.content.events[evtKey];

    const now = moment();

    return now.isBetween(event.start, event.end); // && Boolean(event.npcImageSuffix);
  });

  if (!currEvtKey) return null;
  return {
    event: currEvtKey,
    ...common.content.events[currEvtKey],
  };
}

export function getCurrentEventList () {
  const currentEventKeys = filter(Object.keys(common.content.events), eventKey => {
    const eventData = common.content.events[eventKey];

    return moment().isBetween(eventData.start, eventData.end);
  });

  const currentEventList = [];

  currentEventKeys.forEach(key => {
    currentEventList.push({
      event: key,
      ...common.content.events[key],
    });
  });

  return currentEventList;
}
