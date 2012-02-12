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
    # TODO this is being calculated instead on habit creation in index_view
    # because HabitsCollection instance isn't available here.  Fix that
    position: 0 
    
  isHabit: =>
    @get("habit_type")==1

  isDaily: =>
    @get("habit_type")==2
    
  isTodo: =>
    @get('habit_type')==3

  isDoneTodo: =>
    @isTodo() and @get("done")

  isRemainingTodo: =>
    @isTodo() and !@get("done")
    
  isReward: =>
    @get('habit_type')==4
    
  vote: (direction) ->
    # For negative values, use a line: something like y=-.1x+1
    # For positibe values, taper off with inverse log: y=.9^x
    # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
    sign = if (direction == "up") then 1 else -1
    score = @get("score")
    delta = 0
    if score < 0
      delta = (( -0.1 * score + 1 ) * sign)
    else
      delta = (( Math.pow(0.9, score) ) * sign)
    
    score += delta unless @isReward()
    
    # up/down -voting as checkbox & assigning as done, 2 birds one stone
    done = @get("done")
    if !@isHabit()
      done = true if direction=="up"
      done = false if direction=="down"
    @set({ score: score, done: done })
    window.userStats.updateStats(this, delta)

    #send all the update information, as well as tack on userStats which will save to Users
    @save({ user_stats: window.userStats })
    
class HabitTracker.Collections.HabitsCollection extends Backbone.Collection
  model: HabitTracker.Models.Habit
  url: '/habits'
  comparator: (habit) ->
    habit.get("position")
    
  # Filter down the list of all todo items that are finished.
  doneTodos: ->
    @filter (todo) ->
      todo.get('done') and todo.isTodo()

  nextPosition: ->
    if (!@length) then return 1
    return @max() + 1