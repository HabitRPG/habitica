import {
  shouldDo,
} from '../cron';

/*
Task classes given everything about the class
*/

// TODO move to the client

module.exports = function taskClasses (task, filters = [], dayStart = 0, lastCron = Number(new Date()), showCompleted = false, main = false) {
  if (!task) {
    return '';
  }
  let type = task.type;
  let classes = task.type;
  let completed = task.completed;
  let value = task.value;
  let priority = task.priority;

  if (main && !task._editing) {
    for (let filter in filters) {
      let enabled = filters[filter];
      if (!task.tags) task.tags = [];
      if (enabled && task.tags.indexOf(filter) === -1) {
        return 'hidden';
      }
    }
  }

  classes = task.type;
  if (task._editing) {
    classes += ' beingEdited';
  }

  if (type === 'todo' || type === 'daily') {
    if (completed || (type === 'daily' && !shouldDo(Number(new Date()), task, { // eslint-disable-line no-extra-parens
      dayStart,
    }))) {
      classes += ' completed';
    } else {
      classes += ' uncompleted';
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
