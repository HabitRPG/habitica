HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.IndexView extends Backbone.View
  template: JST["backbone/templates/habits/index"]

  initialize: () ->
    @options.habits.bind('reset', @addAll)

  addAll: () =>
    @options.habits.each(@addOne)

  addOne: (habit) =>
    view = new HabitTracker.Views.Habits.HabitView({model : habit})
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(habits: @options.habits.toJSON() ))
    @addAll()

    return this
