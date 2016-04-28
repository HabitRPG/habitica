import {
  shouldDo
} from '../cron';
/*
Task classes given everything about the class
*/
module.exports = function(task, filters, dayStart, lastCron, showCompleted, main) {
  var classes, completed, enabled, filter, priority, ref, repeat, type, value;
  if (filters == null) {
    filters = [];
  }
  if (dayStart == null) {
    dayStart = 0;
  }
  if (lastCron == null) {
    lastCron = +(new Date);
  }
  if (showCompleted == null) {
    showCompleted = false;
  }
  if (main == null) {
    main = false;
  }
  if (!task) {
    return;
  }
  type = task.type, completed = task.completed, value = task.value, repeat = task.repeat, priority = task.priority;
  if (main) {
    if (!task._editing) {
      for (filter in filters) {
        enabled = filters[filter];
        if (enabled && !((ref = task.tags) != null ? ref[filter] : void 0)) {
          return 'hidden';
        }
      }
    }
  }
  classes = type;
  if (task._editing) {
    classes += " beingEdited";
  }
  if (type === 'todo' || type === 'daily') {
    if (completed || (type === 'daily' && !shouldDo(+(new Date), task, {
      dayStart: dayStart
    }))) {
      classes += " completed";
    } else {
      classes += " uncompleted";
    }
  } else if (type === 'habit') {
    if (task.down && task.up) {
      classes += ' habit-wide';
    }
    if (!task.down && !task.up) {
      classes += ' habit-narrow';
    }
  }
  if (priority === 0.1) {
    classes += ' difficulty-trivial';
  } else if (priority === 1) {
    classes += ' difficulty-easy';
  } else if (priority === 1.5) {
    classes += ' difficulty-medium';
  } else if (priority === 2) {
    classes += ' difficulty-hard';
  }
  if (value < -20) {
    classes += ' color-worst';
  } else if (value < -10) {
    classes += ' color-worse';
  } else if (value < -1) {
    classes += ' color-bad';
  } else if (value < 1) {
    classes += ' color-neutral';
  } else if (value < 5) {
    classes += ' color-good';
  } else if (value < 10) {
    classes += ' color-better';
  } else {
    classes += ' color-best';
  }
  return classes;
};
