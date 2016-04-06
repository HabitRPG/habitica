import i18n from '../i18n';
import preenTodos from '../libs/preenTodos';

// TODO used only in client, move there?

module.exports = function(user, req, cb) {
  var from, id, movedTask, preenedTasks, ref, task, tasks, to;
  id = req.params.id;
  ref = req.query, to = ref.to, from = ref.from;
  task = user.tasks[id];
  if (!task) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTaskNotFound', req.language)
    }) : void 0;
  }
  if (!((to != null) && (from != null))) {
    return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
  }
  tasks = user[task.type + "s"];
  if (task.type === 'todo' && tasks[from] !== task) {
    preenedTasks = preenTodos(tasks);
    if (to !== -1) {
      to = tasks.indexOf(preenedTasks[to]);
    }
    from = tasks.indexOf(preenedTasks[from]);
  }
  if (tasks[from] !== task) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTaskNotFound', req.language)
    }) : void 0;
  }
  movedTask = tasks.splice(from, 1)[0];
  if (to === -1) {
    tasks.push(movedTask);
  } else {
    tasks.splice(to, 0, movedTask);
  }
  return typeof cb === "function" ? cb(null, tasks) : void 0;
};
