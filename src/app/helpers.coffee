moment = require('moment')

# Absolute diff between two dates, based on 12am for both days
module.exports.daysBetween = (a, b) ->
  Math.abs(moment(a).startOf('day').diff(moment(b).startOf('day'), 'days'))
  
module.exports.dayMapping = dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}

module.exports.viewHelpers = (view) ->

  view.fn "percent", (x, y) ->
    x=1 if x==0
    Math.round(x/y*100)
      
  view.fn "round", (num) ->
    Math.round num
    
  view.fn "lt", (a, b) ->
    a < b
  view.fn 'gt', (a, b) -> a > b
  
  view.fn "tokens", (gp) ->
    return gp/0.25

  view.fn "mod", (a, b) ->
    parseInt(a) % parseInt(b) == 0

  view.fn "encodeiCalLink", (uid, apiToken) ->
    loc = window?.location.href or process.env.BASE_URL
    encodeURIComponent "#{loc}users/#{uid}/tasks.ics?apiToken=#{apiToken}"


