HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.IndexView extends Backbone.View
  template: JST["backbone/templates/habits/index"]

  initialize: () ->
    @options.habits.bind('reset', @addAll)
    @options.habits.bind('change', @render, this) #TODO this ruins tabs, revisit
    window.userStats.bind('updatedStats', @updateStats, this)
  
  updateStats: () =>
    # TODO create a view & template, bind to existing element
    stats = window.userStats
    #.to_i.to_s
    $('#tnl').html( "(Level #{stats.get('lvl')})&nbsp;&nbsp;&nbsp;#{Math.round(stats.get('exp'))} / #{stats.tnl()}" )
    $( "#progressbar" ).progressbar value: stats.get('exp')/stats.tnl() * 100

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