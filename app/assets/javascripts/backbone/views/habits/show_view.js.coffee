HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.ShowView extends Backbone.View
  template: JST["backbone/templates/habits/show"]

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
