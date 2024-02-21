import filter from 'lodash/filter';
import moment from 'moment';
import { // eslint-disable-line import/no-cycle
  model as Group,
  TAVERN_ID as tavernId,
} from '../models/group';
import { REPEATING_EVENTS } from '../../common/script/content/constants';
import { getCurrentGalaEvent } from '../../common/script/content/constants/schedule';

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
  const now = moment();
  const currEvtKey = Object.keys(REPEATING_EVENTS).find(evtKey => {
    const event = REPEATING_EVENTS[evtKey];
    const startDate = event.start.replace('1970', now.year());
    const endDate = event.end.replace('1970', now.year());

    return now.isBetween(startDate, endDate);
  });

  if (!currEvtKey) {
    return getCurrentGalaEvent()
  }
  return {
    event: currEvtKey,
    ...REPEATING_EVENTS[currEvtKey],
  };
}

export function getCurrentEventList () {
  const now = moment();
  const currentEventKeys = filter(Object.keys(REPEATING_EVENTS), eventKey => {
    const eventData = REPEATING_EVENTS[eventKey];
    const startDate = eventData.start.replace('1970', now.year());
    const endDate = eventData.end.replace('1970', now.year());

    return now.isBetween(startDate, endDate);
  });

  const currentEventList = [];

  currentEventKeys.forEach(key => {
    currentEventList.push({
      event: key,
      ...REPEATING_EVENTS[key],
    });
  });

  currentEventList.push(getCurrentGalaEvent());
  return currentEventList;
}
