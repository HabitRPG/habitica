export const tasksByCategory = {
  work: [
    {
      type: 'habit',
      text: 'Process email',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Most important task >> Worked on today’s most important task',
      notes: 'Tap to specify your most important task',
    },
    {
      type: 'todo',
      text: 'Work project >> Complete work project',
      notes: 'Tap to specify the name of your current project + set a due date!',
    },
  ],
  exercise: [
    {
      type: 'habit',
      text: '10 min cardio >> + 10 minutes cardio',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Stretching >> Daily workout routine',
      notes: 'Tap to choose your schedule and specify exercises!',
    },
    {
      type: 'todo',
      text: 'Set up workout schedule',
      notes: 'Tap to add a checklist!',
    },
  ],
  health_wellness: [ // eslint-disable-line
    {
      type: 'habit',
      text: 'Eat Health/Junk Food',
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: 'Floss',
      notes: 'Tap to make any changes!',
    },
    {
      type: 'todo',
      text: 'Schedule check-up >> Brainstorm a healthy change',
      notes: 'Tap to add checklists!',
    },
  ],
  school: [
    {
      type: 'habit',
      text: 'Study/Procrastinate',
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: 'Finish homework',
      notes: 'Tap to choose your homework schedule!',
    },
    {
      type: 'todo',
      text: 'Finish assignment for class',
      notes: 'Tap to name the assignment and choose a due date!]',
    },
  ],
  self_care: [ // eslint-disable-line
    {
      type: 'habit',
      text: 'Take a short break',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: '5 minutes of quiet breathing',
      notes: 'Tap to choose your schedule!',
    },
    {
      type: 'todo',
      text: 'Engage in a fun activity',
      notes: 'Tap to specify what you plan to do!',
    },
  ],
  chores: [
    {
      type: 'habit',
      text: '10 minutes cleaning',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Wash dishes',
      notes: 'Tap to choose your schedule!',
    },
    {
      type: 'todo',
      text: 'Organize closet >> Organize clutter',
      notes: 'Tap to specify the cluttered area!',
    },
  ],
  creativity: [
    {
      type: 'habit',
      text: 'Study a master of the craft >> + Practiced a new creative technique',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Work on creative project',
      notes: 'Tap to specify the name of your current project + set the schedule!',
    },
    {
      type: 'todo',
      text: 'Finish creative project',
      notes: 'Tap to specify the name of your project',
    },
  ],
};
