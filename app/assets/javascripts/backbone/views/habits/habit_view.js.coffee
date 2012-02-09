HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.HabitView extends Backbone.View
  template: JST["backbone/templates/habits/habit"]

  events:
    "click .destroy" : "destroy"
    "click .vote-up" : "voteUp"
    "click .vote-down" : "voteDown"

  tagName: "li"
  
  destroy: () ->
    @model.destroy()
    this.remove()
    return false
    
  voteUp: ->
    @model.vote("up")
    @trigger("reset")
    # console.log($(@el).parent().sibling('#habits-todos-done'))
    # if @model.isRemainingTodo and $(@el).parent().id=="habits-remaining-todos"
      # $(@el).parent().sibling('#habits-done-todos').append(this)

  voteDown: ->
    @model.vote("down")

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    
    @$(".comment").qtip content:
      text: (api) ->
        $(this).next().html()
      
    return this
