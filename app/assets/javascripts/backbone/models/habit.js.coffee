class HabitTracker.Models.Habit extends Backbone.Model
  paramRoot: 'habit'

  defaults:
    name: null
    habit_type: 1
    score: 0.0
    notes: null
    up: true
    down: true
    done: false
    position: 0
    
  isHabit: ->
    @get("habit_type")==1

  isDaily: ->
    @get("habit_type")==2

  isDoneTodo: ->
    @get("habit_type")==3 and @get("done")

  isRemainingTodo: ->
    @get("habit_type")==3 and !@get("done")
    
  # TODO before_save on user, calculate delta on score & experience there, not in vote
  # TODO retrieve this formula from server so don't have to have it in two locations (Habit.clear requires it server-side)
  vote: (direction) ->
    # For negative values, use a line: something like y=-.1x+1
    # For positibe values, taper off with inverse log: y=.9^x
    # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
    sign = if (direction == "up") then 1 else -1
    score = this.get("score")
    delta = 0
    if score < 0
      delta = (( -0.1 * score + 1 ) * sign)
    else
      delta = (( Math.pow(0.9, score) ) * sign)
      
    score += delta
    
    # up/down -voting as checkbox & assigning as done, 2 birds one stone
    done = this.get("done")
    if this.get("habit_type")!=1
      done = true if direction=="up"
      done = false if direction=="down"
    
    this.save({ score: score, done: done })
    
class HabitTracker.Collections.HabitsCollection extends Backbone.Collection
  model: HabitTracker.Models.Habit
  
  url: '/habits'
  
  #TODO
  # standard: () ->
    # @filter (habit)->
      # habit.get('habit_type')==1
#   
  # daily: () ->
    # @filter (habit) ->
      # habit.get('habit_type')==2
# 
  # todosDone: () ->
    # @filter (habit) ->
      # (habit.get "done") and (habit.get('habit_type')==3)
#   
  # todosRemaining: () ->
    # @without.apply(this, this.done()) and (habit.get('habit_type')==3)