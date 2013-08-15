_ = require 'lodash'
request = require 'superagent'
expect = require 'expect.js'
require 'coffee-script'
utils = require 'derby-auth/utils'
async = require 'async'

conf = require("nconf")
conf.argv().env().file({file: __dirname + '../config.json'}).defaults

# Override normal ENV values with nconf ENV values (ENV values are used the same way without nconf)
#FIXME can't get nconf file above to load...
process.env.BASE_URL = conf.get("BASE_URL")
process.env.FACEBOOK_KEY = conf.get("FACEBOOK_KEY")
process.env.FACEBOOK_SECRET = conf.get("FACEBOOK_SECRET")
process.env.NODE_DB_URI = 'mongodb://localhost/habitrpg'

## monkey-patch expect.js for better diffs on mocha
## see: https://github.com/LearnBoost/expect.js/pull/34

origBe = expect.Assertion::be
expect.Assertion::be = expect.Assertion::equal = (obj) ->
  @_expected = obj
  origBe.call this, obj

# Custom modules
helpers = require 'habitrpg-shared/script/helpers'

###### Helpers & Variables ######

model = null
uuid = null
taskPath = null
baseURL = 'http://localhost:1337/api/v1'

expectUserEqual = (u1, u2) ->
  'lastCron update__'.split(' ').forEach (path) ->
    delete u1[path]; delete u2[path]
  expect(u1).to.eql(u2)

###### Specs ######

describe 'API', ->
  server = null
  store = null
  model = null
  user = null
  uid = null
  token = null
  username = null

  ###
    Function for registring new users, so we can futz with data
  ###
  registerNewUser = (cb) ->
    randomID = model.id()
    params =
      username: randomID
      password: randomID
      confirmPassword: randomID
      email: "#{randomID}@gmail.com"

    request.post("#{baseURL}/register")
      .set('Accept', 'application/json')
      .send(params)
      .end (res) ->
        cb(res.body)

  before (done) ->
    server = require '../src/server'
    server.listen '1337', '0.0.0.0', ->
      store = server.habitStore
      #store.flush()
      model = store.createModel()

      # nasty hack, why isn't server.listen callback fired when server is completely up?
      setTimeout done, 2000

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
          expect(res.statusCode).to.be 401
          expect(res.body.err).to.be 'You must include a token and uid (user id) in your request'
          done()

  describe 'With token and user id', ->
    params = null
    currentUser = null

    before (done) ->
      registerNewUser (_res) ->
        [uid, token, username] = [_res.id, _res.apiToken, _res.auth.local.username]
        model.query('users').withIdAndToken(uid, token).fetch (err, _user) ->
          console.error {err} if err
          user = _user
          params =
            title: 'Title'
            text: 'Text'
            type: 'habit'
          done()

    beforeEach ->
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
          self = _.clone(currentUser)
          delete self.apiToken
          self.stats.toNextLevel = 150
          self.stats.maxHealth = 50

          expectUserEqual(res.body, self)
          done()

    it 'GET /api/v1/user/task/:id', (done) ->
      tid = _.pluck(currentUser.tasks, 'id')[0]
      request.get("#{baseURL}/user/task/#{tid}")
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
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 201
            expect(res.body.id).not.to.be.empty()
            # Ensure that user owns the newly created object
            expect(user.get().tasks[res.body.id]).to.be.an('object')
            done()

    it 'POST /api/v1/user/task (without type)', (done) ->
      request.post("#{baseURL}/user/task")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send({})
        .end (res) ->
          expect(res.body.err).to.be 'type must be habit, todo, daily, or reward'
          expect(res.statusCode).to.be 400
          done()

    it 'POST /api/v1/user/task (only type)', (done) ->
      request.post("#{baseURL}/user/task")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(type: 'habit')
        .end (res) ->
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 201
            expect(res.body.id).not.to.be.empty()
            # Ensure that user owns the newly created object
            expect(user.get().tasks[res.body.id]).to.be.an('object')
            # Ensure that value gets set to 0 since not otherwise specified
            expect(user.get().tasks[res.body.id].value).to.be.equal(0)
            done()

    it 'PUT /api/v1/user/task/:id', (done) ->
      tid = _.pluck(currentUser.tasks, 'id')[0]
      request.put("#{baseURL}/user/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(text: 'bye')
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          currentUser.tasks[tid].text = 'bye'
          expect(res.body).to.eql currentUser.tasks[tid]
          done()

    it 'PUT /api/v1/user/task/:id (shouldnt update type)', (done) ->
      tid = _.pluck(currentUser.tasks, 'id')[1]
      type = if currentUser.tasks[tid].type is 'habit' then 'daily' else 'habit'
      request.put("#{baseURL}/user/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(type: type, text: 'fishman')
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          currentUser.tasks[tid].text = 'fishman'
          expect(res.body).to.eql currentUser.tasks[tid]
          done()

    it 'PUT /api/v1/user/task/:id (update notes)', (done) ->
      tid = _.pluck(currentUser.tasks, 'id')[2]
      request.put("#{baseURL}/user/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(text: 'hi',notes:'foobar matey')
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          currentUser.tasks[tid].text = 'hi'
          currentUser.tasks[tid].notes = 'foobar matey'
          expect(res.body).to.eql currentUser.tasks[tid]
          done()

    it 'GET /api/v1/user/tasks', (done) ->
      request.get("#{baseURL}/user/tasks")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 200
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

    it 'GET /api/v1/user/tasks (todos)', (done) ->
      request.get("#{baseURL}/user/tasks")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .query(type:'todo')
        .end (res) ->
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 200
            model.ref '_user', user
            model.refList "_todoList", "_user.tasks", "_user.todoIds"
            tasks = model.get("_todoList")
            # Ensure that user owns the tasks
            expect(res.body.length).to.equal tasks.length
            # Ensure that the two sets are equal
            expect(_.difference(_.pluck(res.body,'id'), _.pluck(tasks,'id')).length).to.equal 0
            done()

    it 'DELETE /api/v1/user/task/:id', (done) ->
      tid = currentUser.habitIds[2]
      request.del("#{baseURL}/user/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 204
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(user.get('habitIds').indexOf(tid)).to.be -1
            expect(user.get("tasks.#{tid}")).to.be undefined
            done()

    it 'DELETE /api/v1/user/task/:id (no task found)', (done) ->
      tid = "adsfasdfjunkshouldntbeatask"
      request.del("#{baseURL}/user/task/#{tid}")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .end (res) ->
          expect(res.statusCode).to.be 400
          expect(res.body.err).to.be 'No task found.'
          done()

    it 'POST /api/v1/user/task/:id/up (habit)', (done) ->
      tid = currentUser.habitIds[0]
      request.post("#{baseURL}/user/task/#{tid}/up")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send({})
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          expect(res.body).to.eql { gp: 1, exp: 7.5, lvl: 1, hp: 50, delta: 1 }
          done()

    it 'POST /api/v1/user/task/:id/up (daily)', (done) ->
      tid = currentUser.dailyIds[0]
      request.post("#{baseURL}/user/task/#{tid}/up")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send({})
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          expect(res.body).to.eql { gp: 2, exp: 15, lvl: 1, hp: 50, delta: 1 }
          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(user.get("tasks.#{tid}.completed")).to.be true
            done()

    it 'POST /api/v1/user/task (array)', (done) ->
      habitId = currentUser.habitIds[0]
      dailyId = currentUser.dailyIds[0]
      arr = [{
        id: habitId
        text: 'hello'
        notes: 'note'
      },{
        text: 'new task'
        notes: 'notes!'
      },{
        id: dailyId
        del: true
      }]

      request.post("#{baseURL}/user/tasks")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(arr)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 201
          expect(res.body[0]).to.eql {id: habitId,text: 'hello',notes: 'note'}
          expect(res.body[1].id).to.be.a 'string'
          expect(res.body[1].text).to.be 'new task'
          expect(res.body[1].notes).to.be 'notes!'
          expect(res.body[2]).to.eql deleted: true

          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
          query.fetch (err, user) ->
            expect(user.get("tasks.#{habitId}")).to.eql {id: habitId,text: 'hello',notes: 'note'}
            expect(user.get("tasks.#{dailyId}")).to.be undefined
            expect(user.get("tasks.#{res.body[1].id}")).to.eql id: res.body[1].id, text: 'new task', notes: 'notes!'
            done()

    it 'PUT /api/v1/user', (done) ->
      userBefore = {}
      query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
      query.fetch (err, user) -> userBefore = user.get()

      habitId = currentUser.habitIds[0]
      dailyId = currentUser.dailyIds[0]
      userUpdates =
        stats:
          hp: 30
        flags:
          itemsEnabled: true
        tasks: [{
          id: habitId
          text: 'hello2'
          notes: 'note2'
        },{
          text: 'new task2'
          notes: 'notes2'
        },{
          id: dailyId
          del: true
        }]

      request.put("#{baseURL}/user")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(user: userUpdates)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          tasks = res.body.tasks

          expect(_.find(tasks,{id:habitId})).to.eql {id: habitId,text: 'hello2',notes: 'note2'}
        
          foundNewTask = _.find(tasks,{text:'new task2'})
          expect(foundNewTask.text).to.be 'new task2'
          expect(foundNewTask.notes).to.be 'notes2'
        
          found = _.find(res.body.tasks, {id:dailyId})
          expect(found).to.not.be.ok()

          query.fetch (err, user) ->
            expect(user.get("tasks.#{habitId}")).to.eql {id: habitId, text: 'hello2',notes: 'note2'}
            expect(user.get("tasks.#{dailyId}")).to.be undefined
            tasks = res.body.tasks
            expect(user.get("tasks.#{foundNewTask.id}")).to.eql id: foundNewTask.id, text: 'new task2', notes: 'notes2'
            done()

    it 'POST /api/v1/user/auth/local', (done) ->
      userAuth =
        username: username
        password: 'icculus'
      request.post("#{baseURL}/user/auth")
        .set('Accept', 'application/json')
        .send(userAuth)
        .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          expect(res.body.id).to.be currentUser.id
          expect(res.body.token).to.be currentUser.apiToken
          done()

    it 'POST /api/v1/user/auth/facebook', (done) ->
      id = model.id()
      userAuth = facebook_id: 12345, name: 'Tyler Renelle', email: 'x@y.com'
      newUser = helpers.newUser(true)
      newUser.id = id
      newUser.auth = facebook:
        id: userAuth.facebook_id
        name: userAuth.name
        email: userAuth.email
      model.set "users.#{id}", newUser, ->

        request.post("#{baseURL}/user/auth/facebook")
        .set('Accept', 'application/json')
        .send(userAuth)
        .end (res) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 200
            expect(res.body.id).to.be newUser.id
            #expect(res.body.token).to.be newUser.apiToken
            done()

    it 'POST /api/v1/batch-update (handles corrupt values)', (done) ->
      registerNewUser (_res) ->
        model.set '_userId', _res.id
        model.session = {userId:_res.id}

        # corrupt the tasks, and let's see how the server handles this
        ids = _res.dailyIds
        _res.tasks[ids[0]].value = NaN
        _res.tasks[ids[1]].value = undefined
        _res.tasks[ids[2]] = {}
        _res.tasks["undefined"] = {}

        _res.stats.hp = _res.stats.gp = NaN

        _res.lastCron = +new Date('08/13/2013')

        model.set "users.#{_res.id}", _res, ->
          ops = [{'cron'}]
          request.post("#{baseURL}/user/batch-update")
            .set('Accept', 'application/json')
            .set('X-API-User', _res.id)
            .set('X-API-Key', _res.apiToken)
            .send(ops)
            .end (res) ->
                expect(res.statusCode).to.be 200
                console.log {stats:res.body.stats, tasks:res.body.tasks}
                done()

    it 'POST /api/v1/batch-update', (done) ->
      userBefore = _.cloneDeep(currentUser)

      habits = _.where currentUser.tasks, {type: 'habit'}
      dailys = _.where currentUser.tasks, {type: 'dailys'}
      todos = _.where currentUser.tasks, {type: 'todos'}
      rewards = _.where currentUser.tasks, {type: 'rewards'}

      jsonRaw = [

        # Good scores
        op: 'score', task: habits[0], dir: 'up'
        op: 'score', task: habits[1], dir: 'down'
        op: 'score', task: dailys[1], dir: 'up'
        op: 'score', task: todos[1], dir: 'up'

        # Bad scores, should handle gracefully
        op: 'score', task: todos[2], dir: 'down'
        op: 'score', task: {}, dir: 'up'
        op: 'score', task: {id:null, value: NaN}, dir: 'up'
      ]

      request.post("#{baseURL}/user/batch-update")
        .set('Accept', 'application/json')
        .set('X-API-User', currentUser.id)
        .set('X-API-Key', currentUser.apiToken)
        .send(jsonRaw)
        .end (res) ->
            expect(res.body.err).to.be undefined
            expect(res.statusCode).to.be 200
            expectUserEqual(userBefore, res.body)
            done()

