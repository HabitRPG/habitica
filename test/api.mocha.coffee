expect = require 'expect.js'
{BrowserModel: Model} = require 'racer/test/util/model'
derby = require 'derby'
racer = require 'racer'
_ = require 'underscore'
moment = require 'moment'
request = require 'superagent'
qs = require 'querystring'

## monkey-patch expect.js for better diffs on mocha
## see: https://github.com/LearnBoost/expect.js/pull/34

origBe = expect.Assertion::be
expect.Assertion::be = expect.Assertion::equal = (obj) ->
  @_expected = obj
  origBe.call this, obj

expect.Assertion::assert = (truth, msg, error) ->
  msg = (if @flags.not then error else msg)
  ok = (if @flags.not then not truth else truth)
  unless ok
    err = new Error(msg.call(this))
    if "_expected" of this
      err.expected = @_expected
      err.actual = @obj
    throw err
  @and = new expect.Assertion(@obj)

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

  describe 'Without token or user id', ->

    it '/api/v1/status', (done) ->
      request.get("#{baseURL}/status")
        .set('Accept', 'application/json')
        .end (res) ->
          expect(res.statusCode).to.be 200
          expect(res.body.status).to.be 'up'
          done()

    it '/api/v1/user', (done) ->
      request.get("#{baseURL}/user")
        .set('Accept', 'application/json')
        .end (res) ->
          expect(res.statusCode).to.be 500
          expect(res.body.err).to.be 'You must include a token and uid (user id) in your request'
          done()

  describe 'With token and user id', ->
    params = null
    currentUser = null
    user = null
    model = null
    uid = null

    before ->
      #store.flush()
      model = store.createModel()

      model.set '_userId', uid = model.id()
      user = character.newUserObject()
      user.apiToken = derby.uuid()
      model.set "users.#{uid}", user
      user = model.at("users.#{uid}")
      currentUser = user.get()
      params =
        title: 'Title'
        text: 'Text'
        type: 'habit'

    beforeEach ->
      model = store.createModel()
      currentUser = user.get()

    it 'GET /api/v1/user', (done) ->
      request.get("#{baseURL}/user")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          expect(res.body.id).not.to.be.empty()
          model.set '_user', currentUser
          ###
          currentUser.tasks = []
          for type in ['habit','todo','daily','reward']
            model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
            currentUser.tasks = currentUser.tasks.concat model.get("_#{type}List")
          ###
          expect(res.body).to.eql(currentUser)
          done()

    it 'GET /api/v1/task/:id', (done) ->
      tid = _.values(currentUser.tasks)[0].id
      request.post("#{baseURL}/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          expect(res.body).to.eql currentUser.tasks[tid]
          done()

    it 'POST /api/v1/user/task', (done) ->
      request.post("#{baseURL}/user/task")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(params)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 201
          expect(res.body.id).not.to.be.empty()
          # Ensure that user owns the newly created object
          console.log 'test', _.size(user.get().tasks)
          expect(user.get().tasks[res.body.id]).to.be.an('object')
          done()

    it 'GET /api/v1/user/tasks', (done) ->
      request.get("#{baseURL}/user/tasks")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          currentUser = user.get()
          console.log _.size(currentUser.tasks)
          console.log uid
          console.log 'hellomate', model.get("users.#{uid}")
          model.ref '_user', user
          tasks = []
          for type in ['habit','todo','daily','reward']
            model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
            tasks = tasks.concat model.get("_#{type}List")
          # Ensure that user owns the tasks
          expect(res.body.length).to.equal tasks.length
          # Ensure that the two sets are equal
          expect(_.difference(_.pluck(res.body,'id'), _.pluck(tasks,'id')).length).to.equal 0
          done()
