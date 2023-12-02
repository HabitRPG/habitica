let totalTask = 0;
let totalHab = 0;
let totalDai = 0;
let totalTodo = 0;

export default function addTaskTotal (type) {
  if (type === 'task') {
    totalTask += 1;
    return totalTask;
  }

  if (type === 'habit') {
    totalHab += 1;
    return totalHab;
  }

  if (type === 'daily') {
    totalDai += 1;
    return totalDai;
  }

  if (type === 'todo') {
    totalTodo += 1;
    return totalTodo;
  }

  if (type !== 'habit' || 'task' || 'daily' || 'todo') {
    return -1;
  }

  return 0;
}