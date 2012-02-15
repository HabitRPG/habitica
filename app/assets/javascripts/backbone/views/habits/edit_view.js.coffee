HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.EditView extends Backbone.View
  template : JST["backbone/templates/habits/edit"]

  events :
    "submit #edit-habit" : "update"
    "click .destroy" : "destroy"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (habit) =>
        @model = habit
        window.location.hash = "#"
    )
  
  destroy: () ->
    @model.destroy()
    this.remove()
    window.location.hash = "#"

    return false

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
