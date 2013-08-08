_ = require 'lodash'
request = require 'superagent'
expect = require 'expect.js'
require 'coffee-script'
utils = require 'derby-auth/utils'

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

###### Specs ######

describe 'API', ->
  server = null
  store = null
  model = null
  user = null
  uid = null
  username = null

  before (done) ->
    server = require '../src/server'
    server.listen '1337', '0.0.0.0'
    server.on 'listening', (data) ->
      store = server.habitStore
      #store.flush()
      model = store.createModel()
      model.set '_userId', uid = model.id()
      user = helpers.newUser(true)
      user.apiToken = model.id()
      model.session = {userId:uid}
      salt = utils.makeSalt()
      username = 'jonfishman' + Math.random().toString().split('.')[1]
      user.auth =
        local:
          username: username
          hashed_password: utils.encryptPassword('icculus', salt)
          salt: salt
      model.set "users.#{uid}", user
      delete model.session
      # Crappy hack to let server start before tests run
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

    before ->
      user = model.at("users.#{uid}")
      currentUser = user.get()
      params =
        title: 'Title'
        text: 'Text'
        type: 'habit'

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

          expect(res.body).to.eql self
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
          expect(res.statusCode).to.be 201
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
      console.log {newUser}
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

    it.only 'POST /api/v2', (done) ->
      userBefore = {}
#      user.set "lastCron", +new Date #FIXME this shouldn't be handled here
      query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
      query.fetch (err, user) -> userBefore = user.get()
      console.log {userBefore}

      jsonRaw =
        [{"op":"score","task":{"completed":true,"date":null,"down":null,"id":"049ee706-7992-408f-8bdd-a0f87b6cddee","notes":null,"price":null,"priority":null,"streak":1,"text":"asdasd","type":"daily","up":null,"value":-15.159032750819472},"dir":"down"},{"op":"score","task":{"completed":true,"date":null,"down":null,"id":"049ee706-7992-408f-8bdd-a0f87b6cddee","notes":null,"price":null,"priority":null,"streak":1,"text":"asdasd","type":"daily","up":null,"value":-15.159032750819472},"dir":"up"},{},{},{},{},{"op":"score","task":{"completed":true,"date":null,"down":null,"id":"049ee706-7992-408f-8bdd-a0f87b6cddee","notes":null,"price":null,"priority":null,"streak":1,"text":"asdasd","type":"daily","up":null,"value":-16.63136866553572},"dir":"down"},{"op":"score","task":{"completed":true,"date":null,"down":null,"id":"049ee706-7992-408f-8bdd-a0f87b6cddee","notes":null,"price":null,"priority":null,"streak":1,"text":"asdasd","type":"daily","up":null,"value":-16.63136866553572},"dir":"up"},{},{},{"op":"score","task":{"completed":true,"date":null,"down":null,"history":[{"date":1370796966979,"value":-1.9263318037820194},{"date":1371394179245,"value":-9.632667221983818},{"date":1371987764419,"value":-8.899142684639843},{"date":1371901709065,"value":-8.697714139260505},{"date":1371987764419,"value":-9.947389352351902},{"date":1372072605105,"value":-8.65704735207246},{"date":1372185464158,"value":-9.905420946093672},{"date":1372348155721,"value":-8.616465915449927},{"date":1372404365115,"value":-7.369389857231249},{"date":1372619315210,"value":-6.16153655829917},{"date":1372797766170,"value":-4.990495966065229},{"date":1373266931264,"value":-12.356300657493207},{"date":1373322727209,"value":-10.983796434663102},{"date":1373407801484,"value":-9.658725758132753},{"date":1373639117325,"value":-8.377893411957398},{"date":1373719671601,"value":-7.138418159258412},{"date":1373826521297,"value":-5.902428899644443},{"date":1373839445467,"value":-8.264210410818091},{"date":1373929050162,"value":-8.224444248693572},{"date":1374058202835,"value":-9.459055183497052},{"date":1374102966396,"value":-8.184759693251706},{"date":1374187619046,"value":-6.951403643619735},{"date":1374342649005,"value":-5.72148344218024},{"date":1374434356841,"value":-8.072174632205511},{"date":1374562742400,"value":-10.571154014907808},{"date":1374886027789,"value":-16.097395454285916},{"date":1375011848715,"value":-17.607991906162557},{"date":1375436884647,"value":-16.037773949824242},{"date":1375563074478,"value":-17.546064223707074},{"date":1375568230260,"value":-19.11379232897715},{"date":1375734631073,"value":-20.745784396408645},{"date":1375785010434,"value":-18.767794224069412},{"date":1375826853480,"value":-18.636651213045212}],"id":"fe4b9061-eb58-468c-9b25-10c72be772e6","notes":"","price":null,"priority":null,"repeat":{"su":true,"m":true,"t":true,"w":true,"th":true,"f":true,"s":true},"streak":1,"tags":{"40492758-1202-4d85-8cb3-d40e45f4dd1d":false},"text":"Read 50 pages","type":"daily","up":null,"value":-17.024492021142215},"dir":"up"},{},{},{}]

      request.post("http://localhost:1337/api/v2")
      .set('Accept', 'application/json')
      .set('X-API-User', currentUser.id)
      .set('X-API-Key', currentUser.apiToken)
      .send(jsonRaw)
      .end (res) ->
          expect(res.body.err).to.be undefined
          expect(res.statusCode).to.be 200
          tasks = res.body.tasks

          done()

