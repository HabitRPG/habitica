HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.EditView extends Backbone.View
  template : JST["backbone/templates/habits/edit"]

  events :
    "submit #edit-habit" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (habit) =>
        @model = habit
        window.location.hash = "#/index"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
