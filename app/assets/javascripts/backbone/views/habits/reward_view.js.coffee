HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.RewardView extends Backbone.View
  template: JST["backbone/templates/habits/reward"]
  
  events:
    "click .destroy" : "destroy"
    "click .buy-link" : "voteDown"

  destroy: () ->
    @model.destroy()
    this.remove()
    return false
    
  voteDown: =>
    if @model.get('score') > window.userStats.get('money')
      $('#money').effect("pulsate", 100);      
    else
      @model.vote("down")

  tagName: "li"
  className: "reward"
  
  render: ->
    $(@el).attr('id', "habit_#{@model.get('id')}")
    $(@el).html(@template(@model.toJSON() ))
    
    @$(".comment").qtip content:
      text: (api) ->
        $(this).next().html()
      
    return this
