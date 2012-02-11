HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.IndexView extends Backbone.View
  template: JST["backbone/templates/habits/index"]

  initialize: () ->
    @options.habits.bind('reset', @addAll)
    @options.habits.bind('change', @render, this) #TODO this ruins tabs, revisit
    window.userStats.bind('updatedStats', @updateStats, this)
  
  # TODO create a view & template, bind to existing element
  updateStats: () =>
    stats = window.userStats
    @$('#tnl').html( "(Level #{stats.get('lvl')})&nbsp;&nbsp;&nbsp;#{Math.round(stats.get('exp'))} / #{stats.tnl()}" )
    @$( "#progressbar" ).progressbar value: stats.get('exp')/stats.tnl() * 100

    money = stats.get('money').toFixed(1).split('.')
    @$('#money').html("#{money[0]} <img src='assets/coin_single_gold.png'/>  #{money[1]} <img src='assets/coin_single_silver.png'/>")

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
    @updateStats()
    return this