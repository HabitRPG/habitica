moment = require 'moment'
_ = require 'underscore'

# Absolute diff between two dates
daysBetween = (yesterday, now, dayStart) ->
  #sanity-check reset-time (is it 24h time?)
  dayStart = 0 unless (dayStart? and (dayStart = parseInt(dayStart)) and dayStart >= 0 and dayStart <= 24)
  Math.abs moment(yesterday).startOf('day').add('h', dayStart).diff(moment(now), 'days')

dayMapping = dayMapping = {0:'su',1:'m',2:'t',3:'w',4:'th',5:'f',6:'s',7:'su'}

# http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
# obj: object
# returns random property (the value)
randomVal = (obj) ->
  result = undefined
  count = 0
  for key, val of obj
    result = val if Math.random() < (1 / ++count)
  result

removeWhitespace = (str) ->
  return '' unless str
  str.replace /\s/g, ''

viewHelpers = (view) ->
  view.fn "percent", (x, y) ->
    x=1 if x==0
    Math.round(x/y*100)

  view.fn "round", (num) ->
    Math.round num

  view.fn "floor", (num) ->
    Math.floor num

  view.fn "ceil", (num) ->
    Math.ceil num

  view.fn "lt", (a, b) ->
    a < b
  view.fn 'gt', (a, b) -> a > b

  view.fn "tokens", (gp) ->
    return gp/0.25

  view.fn "mod", (a, b) ->
    parseInt(a) % parseInt(b) == 0

  view.fn "encodeiCalLink", (uid, apiToken) ->
    loc = window?.location.host or process.env.BASE_URL
    encodeURIComponent "http://#{loc}/v1/users/#{uid}/calendar.ics?apiToken=#{apiToken}"

  view.fn 'removeWhitespace', removeWhitespace

  view.fn "notEqual", (a, b) -> (a != b)
  view.fn "and", -> _.reduce arguments, (cumm, curr) -> cumm && curr
  view.fn "or", -> _.reduce arguments, (cumm, curr) -> cumm || curr

  view.fn "truarr", (num) ->
      return num-1

module.exports = { viewHelpers, removeWhitespace, randomVal, daysBetween, dayMapping }
