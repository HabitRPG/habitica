moment = require('moment')

module.exports.daysBetween = (a, b) ->
  #TODO replace this function with moment().diff()?
  DAY = 1000 * 60 * 60  * 24
  # calculate as midnight
  a = new Date( (new Date(a)).toDateString() ) 
  b = new Date( (new Date(b)).toDateString() )
  return Math.abs(Math.floor((a.getTime() - b.getTime()) / DAY))

module.exports.viewHelpers = (view) ->
  view.fn 'taskClasses', (type, completed, value, repeat) ->
    #TODO figure out how to just pass in the task model, so i can access all these properties from one object
    classes = type
      
    # show as completed if completed (naturally) or not required for today
    dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}
    if completed or (repeat and repeat[dayMapping[moment().day()]]==false)
      classes += " completed"
      
    switch
      when value<-8 then classes += ' color-worst'
      when value>=-8 and value<-5 then classes += ' color-worse'
      when value>=-5 and value<-1 then classes += ' color-bad' 
      when value>=-1 and value<1 then classes += ' color-neutral'
      when value>=1 and value<5 then classes += ' color-good' 
      when value>=5 and value<10 then classes += ' color-better' 
      when value>=10 then classes += ' color-best'
    return classes
      
  view.fn "percent", (x, y) ->
    x=1 if x==0
    Math.round(x/y*100)
      
  view.fn "round", (num) ->
    Math.round num
    
  view.fn "gold", (num) -> 
    if num
      return num.toFixed(1).split('.')[0]
    else
      return "0"
  
  view.fn "silver", (num) -> 
    if num
      num.toFixed(1).split('.')[1]
    else
      return "0" 
