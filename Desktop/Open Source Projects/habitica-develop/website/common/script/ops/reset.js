import resetGear from '../fns/resetGear';
import i18n from '../i18n';

module.exports = function reset (user, tasks = []) {
  user.stats.hp = 50;
  user.stats.lvl = 1;
  user.stats.gp = 0;
  user.stats.exp = 0;

  let tasksToRemove = [];
  tasks.forEach(task => {
    let isNotChallengeTask = !task.challenge || !task.challenge.id || task.challenge.broken;
    let isNotGroupTask =  !task.group || !task.group.id || task.group.broken;

    if (isNotChallengeTask && isNotGroupTask) {
      tasksToRemove.push(task._id);
      let i = user.tasksOrder[`${task.type}s`].indexOf(task._id);
      if (i !== -1) user.tasksOrder[`${task.type}s`].splice(i, 1);
    }
  });

  resetGear(user);

  user.preferences.automaticAllocation = false;

  return [
    {user, tasksToRemove},
    i18n.t('resetComplete'),
  ];
};
