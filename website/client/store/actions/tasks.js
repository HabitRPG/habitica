import { loadAsyncResource } from 'client/libs/asyncResource';
import axios from 'axios';
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

export async function fetchCompletedTodos (store, forceLoad = false) {
  // Wait for the user to be loaded before deserializing
  // because user.tasksOrder is necessary
  await store.dispatch('tasks:fetchUserTasks');

  const loadStatus = store.state.completedTodosStatus;
  if (loadStatus === 'NOT_LOADED' || forceLoad) {
    store.state.completedTodosStatus = 'LOADING';

    const response = await axios.get('/api/v3/tasks/user?type=completedTodos');
    const completedTodos = response.data.data;
    const tasks = store.state.tasks.data;
    // Remove existing completed todos
    tasks.todos = tasks.todos.filter(t => !t.completed);
    tasks.todos.push(...completedTodos);

    store.state.completedTodosStatus = 'LOADED';
  } else if (status === 'LOADED') {
    return;
  } else if (loadStatus === 'LOADING') {
    const watcher = store.watch(state => state.completedTodosStatus, (newLoadingStatus) => {
      watcher(); // remove the watcher
      if (newLoadingStatus === 'LOADED') {
        return;
      } else {
        throw new Error(); // TODO add reason?
      }
    });
  }
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