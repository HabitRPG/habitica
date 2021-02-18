import moment from 'moment';
import _ from 'lodash';
import {
  BadRequest,
} from '../errors';
import shared from '../../../common';

export const requiredGroupFields = '_id leader tasksOrder name';

export async function validateTaskAlias (tasks, res) {
  const tasksWithAliases = tasks.filter(task => task.alias);
  const aliases = tasksWithAliases.map(task => task.alias);

  // Compares the short names in tasks against
  // a Set, where values cannot repeat. If the
  // lengths are different, some name was duplicated
  if (aliases.length !== [...new Set(aliases)].length) {
    throw new BadRequest(res.t('taskAliasAlreadyUsed'));
  }

  await Promise.all(tasksWithAliases.map(task => task.validate()));
}

// Takes a Task document and return a plain object of attributes that can be synced to the user
export function syncableAttrs (task) {
  const t = task.toObject(); // lodash doesn't seem to like _.omit on Document
  // only sync/compare important attrs
  const omitAttrs = ['_id', 'userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes', 'updatedAt', 'createdAt', 'group', 'checklist', 'attribute'];
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

/**
 * Moves a task to a specified position.
 *
 * @param  order  The list of ordered tasks
 * @param  taskId  The Task._id of the task to move
 * @param  to A integer specifying the index to move the task to
 *
 * @return Empty
 */
export function moveTask (order, taskId, to) {
  const currentIndex = order.indexOf(taskId);

  // If for some reason the task isn't ordered (should never happen), push it in the new position
  // if the task is moved to a non existing position
  // or if the task is moved to position -1 (push to bottom)
  // -> push task at end of list
  if (!order[to] && to !== -1) {
    order.push(taskId);
    return;
  }

  if (currentIndex !== -1) order.splice(currentIndex, 1);
  if (to === -1) {
    order.push(taskId);
  } else {
    order.splice(to, 0, taskId);
  }
}

export function setNextDue (task, user, dueDateOption) {
  if (task.type !== 'daily') return;

  let now = moment().toDate();
  let dateTaskIsDue = Date.now();
  if (dueDateOption) {
    // @TODO Add required ISO format
    dateTaskIsDue = moment(dueDateOption);

    // If not time is supplied. Let's assume we want start of Custom Day Start day.
    if (
      dateTaskIsDue.hour() === 0
      && dateTaskIsDue.minute() === 0
      && dateTaskIsDue.second() === 0
      && dateTaskIsDue.millisecond() === 0
    ) {
      dateTaskIsDue.add(user.preferences.timezoneOffset, 'minutes');
      dateTaskIsDue.add(user.preferences.dayStart, 'hours');
    }

    now = dateTaskIsDue;
  }

  const optionsForShouldDo = user.preferences.toObject();
  optionsForShouldDo.now = now;
  task.isDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);

  optionsForShouldDo.nextDue = true;
  const nextDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);
  if (nextDue && nextDue.length > 0) {
    task.nextDue = nextDue.map(dueDate => dueDate.toISOString());
  }
}
