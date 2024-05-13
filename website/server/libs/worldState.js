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
  const currentEvents = common.content.getRepeatingEventsOnDate(now);

  if (currentEvents.length === 0) {
    return common.schedule.getCurrentGalaEvent();
  }
  return {
    event: currentEvents[0].key,
    ...currentEvents[0],
  };
}

export function getCurrentEventList () {
  const now = moment();
  const currentEvents = common.content.getRepeatingEventsOnDate(now);
  currentEvents.push(common.schedule.getCurrentGalaEvent());
  return currentEvents;
}
