import { loadAsyncResource } from 'client/libs/asyncResource';
import axios from 'axios';
import compact from 'lodash/compact';
import omit from 'lodash/omit';

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

function sanitizeChecklist (task) {
  if (task.checklist) {
    task.checklist = task.checklist.filter((i) => {
      return Boolean(i.text);
    });
  }
}
export async function create (store, createdTask) {
  const type = `${createdTask.type}s`;
  const list = store.state.tasks.data[type];

  sanitizeChecklist(createdTask);

  list.unshift(createdTask);
  store.state.user.data.tasksOrder[type].unshift(createdTask._id);

  const response = await axios.post('/api/v3/tasks/user', createdTask);

  Object.assign(list[0], response.data.data);
}

export async function save (store, editedTask) {
  const taskId = editedTask._id;
  const type = editedTask.type;
  const originalTask = store.state.tasks.data[`${type}s`].find(t => t._id === taskId);

  sanitizeChecklist(editedTask);

  if (originalTask) Object.assign(originalTask, editedTask);

  const taskDataToSend = omit(editedTask, ['history']);
  const response = await axios.put(`/api/v3/tasks/${taskId}`, taskDataToSend);
  if (originalTask) Object.assign(originalTask, response.data.data);
}

export async function scoreChecklistItem (store, {taskId, itemId}) {
  await axios.post(`/api/v3/tasks/${taskId}/checklist/${itemId}/score`);
}

export async function destroy (store, task) {
  const list = store.state.tasks.data[`${task.type}s`];
  const taskIndex = list.findIndex(t => t._id === task._id);

  if (taskIndex > -1) {
    list.splice(taskIndex, 1);
  }

  await axios.delete(`/api/v3/tasks/${task._id}`);
}

export async function getChallengeTasks (store, payload) {
  let response = await axios.get(`/api/v3/tasks/challenge/${payload.challengeId}`);
  return response.data.data;
}

export async function createChallengeTasks (store, payload) {
  let response = await axios.post(`/api/v3/tasks/challenge/${payload.challengeId}`, payload.tasks);
  return response.data.data;
}

export async function getGroupTasks (store, payload) {
  let response = await axios.get(`/api/v3/tasks/group/${payload.groupId}`);
  return response.data.data;
}

export async function createGroupTasks (store, payload) {
  let response = await axios.post(`/api/v3/tasks/group/${payload.groupId}`, payload.tasks);
  return response.data.data;
}

export async function assignTask (store, payload) {
  let response = await axios.post(`/api/v3/tasks/${payload.taskId}/assign/${payload.userId}`);
  return response.data.data;
}

export async function unassignTask (store, payload) {
  let response = await axios.post(`/api/v3/tasks/${payload.taskId}/unassign/${payload.userId}`);
  return response.data.data;
}

export async function getGroupApprovals (store, payload) {
  let response = await axios.get(`/api/v3/approvals/group/${payload.groupId}`);
  return response.data.data;
}

export async function approve (store, payload) {
  let response = await axios.post(`/api/v3/tasks/${payload.taskId}/approve/${payload.userId}`);
  return response.data.data;
}

export async function unlinkOneTask (store, payload) {
  if (!payload.keep) payload.keep = 'keep';

  let task = payload.task;
  const list = store.state.tasks.data[`${task.type}s`];
  const taskIndex = list.findIndex(t => t._id === task._id);

  if (taskIndex > -1) {
    list.splice(taskIndex, 1);
  }

  let response = await axios.post(`/api/v3/tasks/unlink-one/${payload.task._id}?keep=${payload.keep}`);
  return response.data.data;
}

export async function unlinkAllTasks (store, payload) {
  if (!payload.keep) payload.keep = 'keep-all';
  let response = await axios.post(`/api/v3/tasks/unlink-all/${payload.challengeId}?keep=${payload.keep}`);
  return response.data.data;
}
