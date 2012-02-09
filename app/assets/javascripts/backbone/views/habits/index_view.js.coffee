HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.IndexView extends Backbone.View
  template: JST["backbone/templates/habits/index"]

  initialize: () ->
    @options.habits.bind('reset', @addAll)
    #TODO this is causing "Remaining" tab to be auto-selected
    @options.habits.bind('change', @render, this)

  addAll: () =>
    @options.habits.each(@addOne)

  addOne: (habit) =>
    view = new HabitTracker.Views.Habits.HabitView({model : habit})
    if habit.isHabit() then @$("#habits-habits").append(view.render().el)
    if habit.isDaily() then @$("#habits-daily").append(view.render().el)
    if habit.isDoneTodo() then @$("#habits-todos-done").append(view.render().el)
    if habit.isRemainingTodo() then @$("#habits-todos-remaining").append(view.render().el)
      
  render: =>
    $(@el).html(@template(habits: @options.habits.toJSON() ))
    @addAll()
    @$("#habits-todos").tabs()
    return this