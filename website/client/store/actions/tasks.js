import { loadAsyncResource } from 'client/libs/asyncResource';

import compact from 'lodash/compact';

export function fetchUserTasks (store, forceLoad = false) {
  return loadAsyncResource({
    store,
    path: 'tasks',
    url: '/api/v3/tasks/user',
    deserialize (response) {
      // Wait for the user to be loaded before deserializing
      // because user.tasksOrder is necessary
      return store.dispatch('user:fetch').then((userResource) => {
        return store.dispatch('tasks:order', [response.data.data, userResource.data.tasksOrder]);
      });
    },
    forceLoad,
  });
}

export function order (store, [rawTasks, tasksOrder]) {
  const tasks = {
    habits: [],
    dailys: [],
    todos: [],
    rewards: [],
  };

  rawTasks.forEach(task => {
    tasks[`${task.type}s`].push(task);
  });

  Object.keys(tasks).forEach((type) => {
    let tasksOfType = tasks[type];

    const orderOfType = tasksOrder[type];
    const orderedTasks = new Array(tasksOfType.length);
    const unorderedTasks = []; // what we want to add later

    tasksOfType.forEach((task, index) => {
      const taskId = task._id;
      const i = orderOfType[index] === taskId ? index : orderOfType.indexOf(taskId);
      if (i === -1) {
        unorderedTasks.push(task);
      } else {
        orderedTasks[i] = task;
      }
    });

    tasks[type] = compact(orderedTasks).concat(unorderedTasks);
  });

  return tasks;
}