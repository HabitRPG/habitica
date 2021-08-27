import shuffle from 'lodash/shuffle';
import {
  orderSingleTypeTasks,
  // orderMultipleTypeTasks,
} from '@/libs/store/helpers/orderTasks';

describe('Task Order Helper Function', () => {
  let tasks; let shuffledTasks; let
    taskOrderList;
  beforeEach(() => {
    taskOrderList = [1, 2, 3, 4];
    tasks = [];
    taskOrderList.forEach(i => tasks.push({ _id: i, id: i }));
    shuffledTasks = shuffle(tasks);
  });

  it('should return tasks as is for no task order', () => {
    expect(orderSingleTypeTasks(shuffledTasks)).to.eq(shuffledTasks);
  });

  it('should return tasks in expected order', () => {
    const newOrderedTasks = orderSingleTypeTasks(shuffledTasks, taskOrderList);
    newOrderedTasks.forEach((item, index) => {
      expect(item).to.eq(tasks[index]);
    });
  });

  it('should return new tasks at end of expected order', () => {
    const newTaskIds = [10, 15, 20];
    newTaskIds.forEach(i => tasks.push({ _id: i, id: i }));
    shuffledTasks = shuffle(tasks);

    const newOrderedTasks = orderSingleTypeTasks(shuffledTasks, taskOrderList);
    // checking tasks with order
    newOrderedTasks.slice(0, taskOrderList.length).forEach((item, index) => {
      expect(item).to.eq(tasks[index]);
    });
    // check for new task ids
    newOrderedTasks.slice(-3).forEach(item => {
      expect(item.id).to.be.oneOf(newTaskIds);
    });
  });
});
