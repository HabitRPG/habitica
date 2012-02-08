class HabitTracker.Routers.HabitsRouter extends Backbone.Router
  initialize: (options) ->
    @habits = new HabitTracker.Collections.HabitsCollection()
    @habits.reset options.habits

  routes:
    "/new"      : "newHabit"
    "/index"    : "index"
    "/:id/edit" : "edit"
    "/:id"      : "show"
    ".*"        : "index"

  newHabit: ->
    @view = new HabitTracker.Views.Habits.NewView(collection: @habits)
    $("#habits").html(@view.render().el)

  index: ->
    @view = new HabitTracker.Views.Habits.IndexView(habits: @habits)
    $("#habits").html(@view.render().el)

  show: (id) ->
    habit = @habits.get(id)

    @view = new HabitTracker.Views.Habits.ShowView(model: habit)
    $("#habits").html(@view.render().el)

  edit: (id) ->
    habit = @habits.get(id)

    @view = new HabitTracker.Views.Habits.EditView(model: habit)
    $("#habits").html(@view.render().el)
