import resetGear from '../fns/resetGear';
import i18n from '../i18n';

export default function reset (user, tasks = []) {
  user.stats.hp = 50;
  user.stats.lvl = 1;
  user.stats.points = 1;
  user.stats.con = 0;
  user.stats.str = 0;
  user.stats.per = 0;
  user.stats.int = 0;
  user.stats.gp = 0;
  user.stats.exp = 0;

  const tasksToRemove = [];
  tasks.forEach(task => {
    const isNotChallengeTask = !task.challenge || !task.challenge.id || task.challenge.broken;
    const isNotGroupTask = !task.group || !task.group.id || task.group.broken;

    if (isNotChallengeTask && isNotGroupTask) {
      tasksToRemove.push(task._id);
      const i = user.tasksOrder[`${task.type}s`].indexOf(task._id);
      if (i !== -1) user.tasksOrder[`${task.type}s`].splice(i, 1);
    }
  });

  resetGear(user);

  user.preferences.automaticAllocation = false;

  return [
    { user, tasksToRemove },
    i18n.t('resetComplete'),
  ];
}
