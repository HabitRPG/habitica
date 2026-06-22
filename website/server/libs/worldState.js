import moment from 'moment';
import nconf from 'nconf';
import { // eslint-disable-line import/no-cycle
  model as Group,
  TAVERN_ID as tavernId,
} from '../models/group';
import common from '../../common';
import { gemsPromo } from '../../common/script/content/constants/events';

const AD_HOC_EVENT_BEGIN = nconf.get('AD_HOC_EVENT_BEGIN');
const AD_HOC_EVENT_END = nconf.get('AD_HOC_EVENT_END');
const AD_HOC_EVENT_GEMS = nconf.get('AD_HOC_EVENT_GEMS');
const AD_HOC_EVENT_KEY = nconf.get('AD_HOC_EVENT_KEY');

function adHocEvent () {
  if (!moment().isBetween(AD_HOC_EVENT_BEGIN, AD_HOC_EVENT_END)) {
    return null;
  }
  const event = {
    start: AD_HOC_EVENT_BEGIN,
    end: AD_HOC_EVENT_END,
    event: AD_HOC_EVENT_KEY,    
  };
  if (AD_HOC_EVENT_GEMS === 'true') {
    event.gemsPromo = gemsPromo;
  }
  return event;
}

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
  const extraEvent = adHocEvent();
  if (extraEvent) {
    currentEvents.push(extraEvent);
  }
  currentEvents.push(common.schedule.getCurrentGalaEvent());
  return currentEvents;
}
