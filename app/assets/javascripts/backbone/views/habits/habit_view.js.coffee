HabitTracker.Views.Habits ||= {}

class HabitTracker.Views.Habits.HabitView extends Backbone.View
  template: JST["backbone/templates/habits/habit"]
  
  events:
    "click .destroy" : "destroy"
    "click .vote-up" : "voteUp"
    "click .vote-down" : "voteDown"

  destroy: () =>
    @model.destroy()
    this.remove()
    return false
    
  voteUp: =>
    @model.vote("up")

  voteDown: =>
    @model.vote("down")

  tagName: "li"
  
  # why is @model not available in this function? having to pass it in like this
  dynamicClass: () =>
    output = "habit habit-type-#{@model.get('habit_type')}"
    if @model.get("done") then output += " done"
    score = @model.get("score")
    switch
      when score<-8 then output += ' color-red'
      when score>=-8 and score<-5 then output += ' color-pink'
      when score>=-5 and score<-1 then output += ' color-orange' 
      when score>=-1 and score<1 then output += ' color-yellow'
      when score>=1 and score<5 then output += ' color-green' 
      when score>=5 and score<10 then output += ' color-light-blue' 
      when score>=10 then output += ' color-blue'
    return output
    
  render: ->
    $(@el).attr('id', "habit_#{@model.get('id')}")
    $(@el).attr('class', @dynamicClass())
    $(@el).html(@template(@model.toJSON() ))
    
    @$(".comment").qtip content:
      text: (api) ->
        $(this).next().html()
      
    return this
