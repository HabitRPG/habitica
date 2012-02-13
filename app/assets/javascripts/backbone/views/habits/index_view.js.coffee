HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.IndexView extends Backbone.View
  template: JST["backbone/templates/habits/index"]
  
  events: 
    "keypress .new-habit":  "createOnEnter",
    # "keyup .new-habit":     "showTooltip", #TODO get this function todo.js
    "click .clear-completed": "clearCompleted"

  initialize: () ->
    @options.habits.bind('reset', @addAll)
    @options.habits.bind('change', @render, this) #TODO this ruins tabs, revisit
    @options.habits.bind('add', @render, this)
    window.userStats.bind('updatedStats', @updateStats, this)
    
  createOnEnter: (e) ->
    input = $(e.target)
    if (!input.val() or e.keyCode != 13) then return
    
    # See commit bd7a49c new_view.js.coffee for more code surrounding this functionality
    new_habit =
      name: input.val()
      habit_type: input.attr('data-type') 
      position: @options.habits.nextPosition()
      # score: ( (input.attr('data-type')=='4') ? 0.0 : 0.0 ) #TODO not working
      
    @options.habits.create new_habit,
      #TODO what's this all about?
      success: (habit) ->
        @model = habit
      error: (habit, jqXHR) ->
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    input.val('')
    
  clearCompleted: ->
    _.each @options.habits.doneTodos(), (todo) ->
      todo.destroy()
    @render()
    return false

  # TODO create a view & template, bind to existing element
  updateStats: () =>
    stats = window.userStats
    $('#tnl').html( "(Level #{stats.get('lvl')})&nbsp;&nbsp;&nbsp;#{Math.round(stats.get('exp'))} / #{stats.tnl()}" )
    $( "#progressbar" ).progressbar value: stats.get('exp')/stats.tnl() * 100

    # TODO for some reason this has to be @$, but above has to be $
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
    if habit.isReward() then @$("#rewards").append(view.render().el)
    
  render: =>
    $(@el).html(@template(habits: @options.habits.toJSON() ))
    @addAll()
    @$("#habits-todos").tabs()
    @updateStats()
    @$(".sortable").sortable
      axis: "y"
      dropOnEmpty: false
      cursor: "move"
      items: "li"
      opacity: 0.4
      scroll: true
      update: ->
        $.ajax
          type: "post"
          url: "/habits/sort"
          data: $(this).sortable("serialize")
          dataType: "script"
    return this
