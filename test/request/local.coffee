Request = require './request'
qs = require 'querystring'

makeUrl = (path, params) ->
  if typeof params is "object"
    params = qs.stringify(params)
  else
    params = ''
  return "http://localhost:3000/#{path}?#{params}"

# url, params (optional), callback
get = (obj, callback) ->
  obj.params ||= {}
  obj.path ||= ''

  requestUrl = makeUrl obj.path, obj.params

  request = new Request requestUrl

  request.done (res) ->
    callback null, JSON.parse(res)

  request.fire()

module.exports = { get }
