HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.NewView extends Backbone.View
  template: JST["backbone/templates/habits/new"]

  events:
    "submit #new-habit": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (habit) =>
        @model = habit
        window.location.hash = "#/index"

      error: (habit, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
