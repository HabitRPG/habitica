import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

// sets task order for single task type only.
// Accepts task list and corresponding taskorder for its task type.
export function orderSingleTypeTasks (rawTasks, taskOrder = []) {
  // if there is no predefined task order return task list as is.
  if (isEmpty(taskOrder)) return rawTasks;
  // // eslint-disable-next-line no-console
  // console.log('orderSingleTypeTasks: taskOrder', taskOrder);
  const orderedTasks = new Array(rawTasks.length);
  const unorderedTasks = []; // What we want to add later

  rawTasks.forEach((task, index) => {
    const taskId = task._id;
    const i = taskOrder[index] === taskId ? index : taskOrder.indexOf(taskId);
    if (i === -1) {
      unorderedTasks.push(task);
    } else {
      orderedTasks[i] = task;
    }
  });

  return compact(orderedTasks).concat(unorderedTasks);
}

export function orderMultipleTypeTasks (rawTasks, tasksOrder) {
  return {
    habits: orderSingleTypeTasks(rawTasks.habits, tasksOrder.habits),
    dailys: orderSingleTypeTasks(rawTasks.dailys, tasksOrder.dailys),
    todos: orderSingleTypeTasks(rawTasks.todos, tasksOrder.todos),
    rewards: orderSingleTypeTasks(rawTasks.rewards, tasksOrder.rewards),
  };
}