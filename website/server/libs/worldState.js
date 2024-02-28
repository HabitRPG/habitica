import filter from 'lodash/filter';
import moment from 'moment';
import { // eslint-disable-line import/no-cycle
  model as Group,
  TAVERN_ID as tavernId,
} from '../models/group';
import common from '../../common';

export async function getWorldBoss () {
  const tavern = await Group.findById(tavernId)
    .select('quest.progress quest.key quest.active quest.extra')
    .exec();
  if (tavern && tavern.quest && tavern.quest.active) {
    return tavern.quest;
  }
  return {};
}

export function getCurrentEvent () {
  const now = moment();
  const currEvtKey = Object.keys(common.content.repeatingEvents).find(
    evtKey => {
      const event = common.content.repeatingEvents[evtKey];
      const startDate = event.start.replace('1970', now.year());
      const endDate = event.end.replace('1970', now.year());

      return now.isBetween(startDate, endDate);
    },
  );

  if (!currEvtKey) {
    return common.schedule.getCurrentGalaEvent();
  }
  return {
    event: currEvtKey,
    ...common.content.repeatingEvents[currEvtKey],
  };
}

export function getCurrentEventList () {
  const now = moment();
  const currentEventKeys = filter(
    Object.keys(common.content.repeatingEvents),
    eventKey => {
      const eventData = common.content.repeatingEvents[eventKey];
      const startDate = eventData.start.replace('1970', now.year());
      const endDate = eventData.end.replace('1970', now.year());

      return now.isBetween(startDate, endDate);
    },
  );

  const currentEventList = [];

  currentEventKeys.forEach(key => {
    currentEventList.push({
      event: key,
      ...common.content.repeatingEvents[key],
    });
  });
  currentEventList.push(common.schedule.getCurrentGalaEvent());
  return currentEventList;
}
