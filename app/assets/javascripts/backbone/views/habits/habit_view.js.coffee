HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.HabitView extends Backbone.View
  template: JST["backbone/templates/habits/habit"]

  events:
    "click .destroy" : "destroy"

  tagName: "tr"

  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
