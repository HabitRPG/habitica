import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

// sets task order for single task type only.
// Accepts task list and corresponding taskorder for its task type.
export default function (rawTasks, taskOrder) {
  // if there is no predefined task order return task list as is.
  if (isEmpty(taskOrder)) return rawTasks;

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
