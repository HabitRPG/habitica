import t from './translation';

export const tasksByCategory = {
  work: [
    {
      type: 'habit',
      text: t('workHabitMail'),
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: t('workDailyImportantTask'),
      notes: t('workDailyImportantTaskNotes'),
    },
    {
      type: 'todo',
      text: t('workTodoProject'),
      notes: t('workTodoProjectNotes'),
    },
  ],
  exercise: [
    {
      type: 'habit',
      text: t('exerciseHabit'),
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: t('exerciseDailyText'),
      notes: t('exerciseDailyNotes'),
    },
    {
      type: 'todo',
      text: t('exerciseTodoText'),
      notes: t('exerciseTodoNotes'),
    },
  ],
  health_wellness: [ // eslint-disable-line
    {
      type: 'habit',
      text: t('healthHabit'),
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: t('healthDailyText'),
      notes: t('healthDailyNotes'),
    },
    {
      type: 'todo',
      text: t('healthTodoText'),
      notes: t('healthTodoNotes'),
    },
  ],
  school: [
    {
      type: 'habit',
      text: t('schoolHabit'),
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: t('schoolDailyText'),
      notes: t('schoolDailyNotes'),
    },
    {
      type: 'todo',
      text: t('schoolTodoText'),
      notes: t('schoolTodoNotes'),
    },
  ],
  self_care: [ // eslint-disable-line
    {
      type: 'habit',
      text: t('selfCareHabit'),
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: t('selfCareDailyText'),
      notes: t('selfCareDailyNotes'),
    },
    {
      type: 'todo',
      text: t('selfCareTodoText'),
      notes: t('selfCareTodoNotes'),
    },
  ],
  chores: [
    {
      type: 'habit',
      text: t('choresHabit'),
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: t('choresDailyText'),
      notes: t('choresDailyNotes'),
    },
    {
      type: 'todo',
      text: t('choresTodoText'),
      notes: t('choresTodoNotes'),
    },
  ],
  creativity: [
    {
      type: 'habit',
      text: t('creativityHabit'),
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: t('creativityDailyText'),
      notes: t('creativityDailyNotes'),
    },
    {
      type: 'todo',
      text: t('creativityTodoText'),
      notes: t('creativityTodoNotes'),
    },
  ],
};
