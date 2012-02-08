class HabitTracker.Models.Habit extends Backbone.Model
  paramRoot: 'habit'

  defaults:
    name: null
    habit_type: null
    score: null
    notes: null
    up: null
    down: null
    done: null
    position: null

class HabitTracker.Collections.HabitsCollection extends Backbone.Collection
  model: HabitTracker.Models.Habit
  url: '/habits'
