assert = require 'assert'
{BrowserModel: Model} = require 'racer/test/util/model'
derby = require 'derby'
racer = require 'racer'
_ = require 'underscore'
moment = require 'moment'
request = require 'superagent'
qs = require 'querystring'

racer.use require 'racer-db-mongo'

store = racer.createStore
  db:
    type: 'Mongo'
    uri: process.env.NODE_DB_URI

# Custom modules
scoring = require '../src/app/scoring'
character = require '../src/app/character'
config = require './config'

###### Helpers & Variables ######

model = null
uuid = null
taskPath = null
baseURL = 'http://localhost:3000/api/v1'
UID_AND_TOKEN =
  uid: config.uid
  token: config.token

## Helper which clones the content at a path so tests can compare before/after values
# Otherwise, using model.get(path) will give the same object before as after
pathSnapshots = (paths) ->
  if _.isString(paths)
    return clone(model.get(paths))
  _.map paths, (path) -> clone(model.get(path))
statsTask = -> pathSnapshots(['_user.stats', taskPath]) # quick snapshot of user.stats & task

cleanUserObj = ->
  userObj = character.newUserObject()
  userObj.tasks = {}
  userObj.habitIds = []
  userObj.dailyIds = []
  userObj.todoIds = []
  userObj.rewardIds = []
  return userObj
resetUser = -> model.set '_user', cleanUserObj()

freshTask = (taskObj) ->
  resetUser()
  # create a test task
  uuid = derby.uuid()
  taskPath = "_user.tasks.#{uuid}"
  {type} = taskObj
  model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
  [taskObj.id, taskObj.value] = [uuid, 0]
  model.at("_#{type}List").push taskObj

###
Helper function to determine if stats updates are numerically correct based on scoring
@direction: 'up' or 'down'
@options: The user stats modifiers and times to run, defaults to {times:1, modifiers:{lvl:1, weapon:0, armor:0}}
###
modificationsLookup = (direction, options = {}) ->
  merged = _.defaults options, {times:1, lvl:1, weapon:0, armor:0}
  {times, lvl, armor, weapon}  = merged
  userObj = cleanUserObj()
  value = 0
  _.times times, (n) ->
    delta = scoring.taskDeltaFormula(value, direction)
    value += delta
    if direction=='up'
      gain = scoring.expModifier(delta, options)
      userObj.stats.exp += gain
      userObj.stats.money += gain
    else
      loss = scoring.hpModifier(delta, options)
      userObj.stats.hp += loss
  return {user:userObj, value:value}

###### Specs ######

describe 'API', ->
  model = null
  user = null
  params = null

  describe 'Without token or user id', ->

    it '/api/v1/status', (done) ->
      request.get("#{baseURL}/status")
        .set('Accept', 'application/json')
        .end (res) ->
          assert.equal res.statusCode, 200
          assert.equal res.body.status, 'up'
          done()

    it '/api/v1/user', (done) ->
      request.get("#{baseURL}/user")
        .set('Accept', 'application/json')
        .end (res) ->
          assert.equal res.statusCode, 500
          assert.ok JSON.parse(res.text).err
          done()

  describe 'With token and user id', ->
    before (done) ->
      model = store.createModel()
      #store.flush()

      model.set '_userId', uid = model.id()
      user = character.newUserObject()
      user.apiToken = derby.uuid()
      model.set "users.#{uid}", user
      user = model.at("users.#{uid}")
      currentUser = user.get()

      params =
        uid: currentUser.id
        token: currentUser.apiToken
        title: 'Title'
        text: 'Text'
        type: 'habit'
      done()

    ###
    it '/api/v1/user', (done) ->
      console.log "#{baseURL}/user?#{qs.stringify(params)}"
      request.get("#{baseURL}/user")
        .set('Accept', 'application/json')
        .query(params)
        .on('error', (err) ->
          console.log 'err', err
        )
        .end (res) ->
          assert.ok !res.body.err
          assert.equal res.statusCode, 200
          assert.ok res.body
          console.log res.body
         done()
    ###

    it '/api/v1/user/task', (done) ->
      request.post("#{baseURL}/user/task")
        .set('Accept', 'application/json')
        .send(params)
        .end (res) ->
          currentUser = user.get()
          assert.ok !res.body.err
          assert.equal res.statusCode, 201
          assert.ok res.body.id
          assert.ok currentUser.tasks[res.body.id]
          done()
