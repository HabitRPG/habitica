_ = require 'lodash'
expect = require 'expect.js'
require 'coffee-script'
async = require 'async'
superagentDefaults = require 'superagent-defaults'

request = superagentDefaults()

conf = require("nconf")
conf.argv().env().file({file: __dirname + '../config.json'}).defaults
conf.set('port','1337')

# Override normal ENV values with nconf ENV values (ENV values are used the same way without nconf)
#FIXME can't get nconf file above to load...
process.env.BASE_URL = conf.get("BASE_URL")
process.env.FACEBOOK_KEY = conf.get("FACEBOOK_KEY")
process.env.FACEBOOK_SECRET = conf.get("FACEBOOK_SECRET")
process.env.NODE_DB_URI = 'mongodb://localhost/habitrpg'

User = require('../../src/models/user').model
Group = require('../../src/models/group').model
Challenge = require('../../src/models/challenge').model

app = require '../../src/server'

## monkey-patch expect.js for better diffs on mocha
## see: https://github.com/LearnBoost/expect.js/pull/34
#origBe = expect.Assertion::be
#expect.Assertion::be = expect.Assertion::equal = (obj) ->
#  @_expected = obj
#  origBe.call this, obj

# Custom modules
shared = require 'habitrpg-shared'

###### Helpers & Variables ######

model = null
uuid = null
taskPath = null
baseURL = 'http://localhost:3000/api/v2'

###
  expect().eql expects object keys to be in the correct order, this sorts that out
###

expectUserEqual = (u1, u2) ->
  [u1, u2] = _.map [u1, u2], (obj) ->
    'update__ stats.toNextLevel stats.maxHealth __v'.split(' ').forEach (path) ->
      helpers.dotSet path, null, obj
    sorted = {}
    _.each _.keys(obj).sort(), (k) -> sorted[k] = obj[k]
    sorted.tasks = _.sortBy sorted.tasks, 'id'
    sorted
#  console.log {u1, u2}
  expect(u1).to.eql(u2)

expectSameValues = (obj1, obj2, paths) ->
  _.each paths, (k) ->
    expect(helpers.dotGet(k,obj1)).to.eql helpers.dotGet(k,obj2)

expectCode = (res, code) ->
  expect(res.body.err).to.be undefined if code is 200
  expect(res.statusCode).to.be code

###### Specs ######

describe 'API', ->
  user = null
  _id = null
  apiToken = null
  username = null
  password = null

  registerNewUser = (cb, main=true)->
    randomID = shared.uuid()
    [username,password] = [randomID,randomID] if main
    request.post("#{baseURL}/register")
    .set('Accept', 'application/json')
    .send({
      username: randomID
      password: randomID
      confirmPassword: randomID
      email: "#{randomID}@gmail.com"
    })
    .end (res) ->
      return cb(null,res.body) unless main
      {_id,apiToken} = res.body
      console.log {_id,apiToken}
      User.findOne {_id, apiToken}, (err, _user) ->
        expect(err).to.not.be.ok
        user = _user
        request
          .set('Accept', 'application/json')
          .set('X-API-User', _id)
          .set('X-API-Key', apiToken)
        cb null, res.body

  before (done)->
    require '../../src/server' #start the server
    # then wait for it to do it's thing. TODO make a cb-compatible export of server
    setTimeout done, 2000

  describe 'Without token or user id', ->
    it '/api/v2/status', (done) ->
      request.get("#{baseURL}/status")
        .set('Accept', 'application/json')
        .end (res) ->
          expect(res.statusCode).to.be 200
          expect(res.body.status).to.be 'up'
          done()

    it '/api/v2/user', (done) ->
      request.get("#{baseURL}/user")
        .set('Accept', 'application/json')
        .end (res) ->
          expect(res.statusCode).to.be 401
          expect(res.body.err).to.be 'You must include a token and uid (user id) in your request'
          done()

  describe 'With token and user id', ->
    currentUser = null

    before (done) ->
      registerNewUser(done,true)

    beforeEach (done) ->
      User.findById _id, (err,_user) ->
        currentUser = _user
        done()

    ############
    #  Groups
    ############

    describe 'Groups', ->
      group = undefined

      before (done) ->
        request.post("#{baseURL}/groups")
        .send({name:"TestGroup", type:"party"})
        .end (res) ->
          expectCode res, 200
          group = res.body
          expect(group.members.length).to.be 1
          expect(group.leader).to.be user._id
          done()

      describe 'Challenges', ->
        challenge = undefined
        updateTodo = undefined

        it 'Creates a challenge', (done) ->
          request.post("#{baseURL}/challenges")
          .send({
            group:group._id
            dailys: [{type:'daily',text:'Challenge Daily'}]
            todos: [{type:'todo', text:'Challenge Todo', notes:'Challenge Notes'}]
            rewards: []
            habits: []
            official: true
          })
          .end (res) ->
            expectCode res, 200
            async.parallel [
              (cb) -> User.findById _id, cb
              (cb) -> Challenge.findById res.body._id, cb
            ], (err, results) ->
              [_user,challenge] = [results[0],results[1]]
              expect(_user.dailys[_user.dailys.length-1].text).to.be('Challenge Daily')
              updateTodo = _user.todos[_user.todos.length-1]
              expect(updateTodo.text).to.be('Challenge Todo')
              expect(challenge.official).to.be false
              done()

        it 'User updates challenge notes', (done) ->
          updateTodo.notes = "User overriden notes"
          request.put("#{baseURL}/user/tasks/#{updateTodo.id}")
          .send(updateTodo)
          .end (res) ->
              done() #we'll do the check down below

        it 'Change challenge daily', (done) ->
          challenge.dailys[0].text = 'Updated Daily'
          challenge.todos[0].notes = 'Challenge Updated Todo Notes'
          request.post("#{baseURL}/challenges/#{challenge._id}")
          .send(challenge)
          .end (res) ->
            setTimeout ->
              User.findById _id, (err,_user) ->
                expectCode res, 200
                expect(_user.dailys[_user.dailys.length-1].text).to.be('Updated Daily')
                expect(res.body.todos[0].notes).to.be('Challenge Updated Todo Notes')
                expect(_user.todos[_user.todos.length-1].notes).to.be('User overriden notes')
                currentUser = _user
                done()
            , 500 # we have to wait a while for users' tasks to be updated, called async on server

        it 'Shows user notes on challenge page', (done) ->
          request.get("#{baseURL}/challenges/#{challenge._id}/member/#{_id}")
          .end (res) ->
              expect(res.body.todos[res.body.todos.length-1].notes).to.be('User overriden notes')
              done()

        it 'Complete To-Dos', (done) ->
          u = currentUser
          request.post("#{baseURL}/user/tasks/#{u.todos[0].id}/up").end (res) ->
            request.post("#{baseURL}/user/tasks/#{u.todos[1].id}/up").end (res) ->
              request.post("#{baseURL}/user/tasks/").send({type:'todo'}).end (res) ->
                request.post("#{baseURL}/user/tasks/clear-completed").end (res) ->
                  expect(_.size res.body).to.be 2
                  done()

        it 'Admin creates a challenge', (done) ->
          User.findByIdAndUpdate _id, {$set:{'contributor.admin':true}}, (err,_user) ->
            expect(err).to.not.be.ok

            async.parallel [
              (cb)->
                request.post("#{baseURL}/challenges")
                .send({group:group._id, dailys: [], todos: [], rewards: [], habits: [], official: false}).end (res) ->
                  expect(res.body.official).to.be false
                  cb()
              (cb)->
                request.post("#{baseURL}/challenges")
                .send({group:group._id, dailys: [], todos: [], rewards: [], habits: [], official: true}).end (res) ->
                  expect(res.body.official).to.be true
                  cb()
            ], done


      describe 'Quests', ->
        party = undefined
        participating = []
        notParticipating = []

        it 'Invites some members', (done) ->
          async.waterfall [

            # Register new users
            (cb) ->
              async.parallel [
                (cb2) -> registerNewUser(cb2,false)
                (cb2) -> registerNewUser(cb2,false)
                (cb2) -> registerNewUser(cb2,false)
              ], cb

            # Send them invitations
            (_party, cb) ->
              party = _party
              async.parallel [
                (cb2) -> request.post("#{baseURL}/groups/#{group._id}/invite?uuid=#{party[0]._id}").end (-> cb2())
                (cb2) -> request.post("#{baseURL}/groups/#{group._id}/invite?uuid=#{party[1]._id}").end (-> cb2())
                (cb2) -> request.post("#{baseURL}/groups/#{group._id}/invite?uuid=#{party[2]._id}").end (-> cb2())
              ], cb

            # Accept / Reject
            (results, cb) ->
              #series since they'll be modifying the same group record
              async.series (_.reduce party, (m,v,i) ->
                m.push (cb2) ->
                  request.post("#{baseURL}/groups/#{group._id}/join")
                  .set('X-API-User', party[i]._id)
                  .set('X-API-Key', party[i].apiToken)
                  .end (res) -> cb2()
                m
              , []), cb

            # Make sure the invites stuck
            (whatever, cb) ->
              Group.findById group._id, (err, g) ->
                expect(g.members.length).to.be 4
                cb()

          ], (err, results) ->
            expect(err).to.be.ok
            done()

        it 'Starts a quest', (done) ->
          async.waterfall [
            (cb)->
              request.post("#{baseURL}/groups/#{group._id}/questAccept?key=evilsanta")
              .end (res) ->
                expectCode(res, 401)
                User.findByIdAndUpdate _id, {$set:'items.quests.evilsanta':1}, cb
            (_user,cb)->
              request.post("#{baseURL}/groups/#{group._id}/questAccept?key=evilsanta")
              .end (res) ->
                expectCode(res, 200)
                Group.findById group._id,cb
            (_group,cb)->
              group = _group #refresh local group
              expect(group.quest.key).to.be 'evilsanta'

              async.series (_.reduce party, (m,v,i) ->
                m.push (cb2) ->
                  request.post("#{baseURL}/groups/#{group._id}/questAccept")
                  .set('X-API-User', party[i]._id)
                  .set('X-API-Key', party[i].apiToken)
                  .end (res) -> cb2()
                m
              , []), cb

          ], done

      it "Doesn't include people who aren't participating"


#    ############
#    #  Batch Update
#    ############
#
#    describe 'Batch Update', ->
#
#      it 'POST /api/v1/batch-update', (done) ->
#        userBefore = _.cloneDeep(currentUser)
#
#        ops = [
#          # Good scores
#          op: 'score', params: {id:user.habits[0].id, direction: 'up'}
#          op: 'score', params: {id:user.habits[1].id, direction: 'down'}
#          op: 'score', params: {id:user.dailys[0].id, direction: 'up'}
#          op: 'score', params: {id:user.todos[0].id, direction: 'up'}
#        ]
#
#        request.post("#{baseURL}/user/batch-update")
#        .send(ops)
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          #expectUserEqual(userBefore, res.body)
#          done()
#
#
#    ############
#    #  To Be Updated (these are old v1 tests which haven't been touched in over 6 months, need to be portd to new API tests or deleted)
#    ############
#
#    it.skip 'POST /api/v2/batch-update (handles corrupt values)', (done) ->
#      registerNewUser (_res) ->
#        # corrupt the tasks, and let's see how the server handles this
#        ids = _res.dailyIds
#        _res.tasks[ids[0]].value = NaN
#        _res.tasks[ids[1]].value = undefined
#        _res.tasks[ids[2]] = {}
#        _res.tasks["undefined"] = {}
#
#        _res.stats.hp = _res.stats.gp = NaN
#
#        _res.lastCron = +new Date('08/13/2013')
#
#        ops = [
#          op: 'score', task: _res.tasks[ids[0]], dir: 'up'
#        ]
#
#        model.set "users.#{_res.id}", _res, ->
#          request.post("#{baseURL}/user/batch-update")
#          .set('Accept', 'application/json')
#          .set('X-API-User', _res.id)
#          .set('X-API-Key', _res.apiToken)
#          .send(ops)
#          .end (res) ->
#              expect(res.statusCode).to.be 200
#              console.log {stats:res.body.stats, tasks:res.body.tasks}
#              done()
#
#
#    #FIXME figure out how to compare the objects
#    it.skip 'GET /api/v1/user', (done) ->
#      request.get("#{baseURL}/user")
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          expect(res.body.id).not.to.be.empty()
#          self = _.clone(currentUser)
#          delete self.apiToken
#          self.stats.toNextLevel = 150
#          self.stats.maxHealth = 50
#
#          expectUserEqual(res.body, self)
#          done()
#
#    it.skip 'GET /api/v1/user/task/:id', (done) ->
#      tid = _.pluck(currentUser.tasks, 'id')[0]
#      request.get("#{baseURL}/user/task/#{tid}")
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          expect(res.body).to.eql currentUser.tasks[tid]
#          done()
#
#    it.skip 'POST /api/v1/user/task', (done) ->
#      request.post("#{baseURL}/user/task")
#        .send({title: 'Title', text: 'Text', type: 'habit'})
#        .end (res) ->
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(res.body.err).to.be undefined
#            expect(res.statusCode).to.be 201
#            expect(res.body.id).not.to.be.empty()
#            # Ensure that user owns the newly created object
#            saved = user.get("tasks.#{res.body.id}")
#            expect(saved).to.be.an('object')
#            done()
#
#    it.skip 'POST /api/v1/user/task (without type)', (done) ->
#      request.post("#{baseURL}/user/task")
#        .send({})
#        .end (res) ->
#          expect(res.body.err).to.be 'type must be habit, todo, daily, or reward'
#          expect(res.statusCode).to.be 400
#          done()
#
#    it.skip 'POST /api/v1/user/task (only type)', (done) ->
#      request.post("#{baseURL}/user/task")
#        .send(type: 'habit')
#        .end (res) ->
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(res.body.err).to.be undefined
#            expect(res.statusCode).to.be 201
#            expect(res.body.id).not.to.be.empty()
#            # Ensure that user owns the newly created object
#            expect(user.get().tasks[res.body.id]).to.be.an('object')
#            # Ensure that value gets set to 0 since not otherwise specified
#            expect(user.get().tasks[res.body.id].value).to.be.equal(0)
#            done()
#
#    it.skip 'PUT /api/v1/user/task/:id', (done) ->
#      tid = _.pluck(currentUser.tasks, 'id')[0]
#      request.put("#{baseURL}/user/task/#{tid}")
#        .send(text: 'bye')
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          currentUser.tasks[tid].text = 'bye'
#          expectSameValues res.body, currentUser.tasks[tid], ['id','type','text']
#          #expect(res.body).to.eql currentUser.tasks[tid]
#          done()
#
#    it.skip 'PUT /api/v1/user/task/:id (shouldnt update type)', (done) ->
#      tid = _.pluck(currentUser.tasks, 'id')[1]
#      type = if currentUser.tasks[tid].type is 'habit' then 'daily' else 'habit'
#      request.put("#{baseURL}/user/task/#{tid}")
#        .send(type: type, text: 'fishman')
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          currentUser.tasks[tid].text = 'fishman'
#          expect(res.body).to.eql currentUser.tasks[tid]
#          done()
#
#    it.skip 'PUT /api/v1/user/task/:id (update notes)', (done) ->
#      tid = _.pluck(currentUser.tasks, 'id')[2]
#      request.put("#{baseURL}/user/task/#{tid}")
#        .send(text: 'hi',notes:'foobar matey')
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          currentUser.tasks[tid].text = 'hi'
#          currentUser.tasks[tid].notes = 'foobar matey'
#          expect(res.body).to.eql currentUser.tasks[tid]
#          done()
#
#    it.skip 'GET /api/v1/user/tasks', (done) ->
#      request.get("#{baseURL}/user/tasks")
#        .end (res) ->
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(res.body.err).to.be undefined
#            expect(user.get()).to.be.ok()
#            expect(res.statusCode).to.be 200
#            model.ref '_user', user
#            tasks = []
#            for type in ['habit','todo','daily','reward']
#              model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
#              tasks = tasks.concat model.get("_#{type}List")
#            # Ensure that user owns the tasks
#            expect(res.body.length).to.equal tasks.length
#            # Ensure that the two sets are equal
#            expect(_.difference(_.pluck(res.body,'id'), _.pluck(tasks,'id')).length).to.equal 0
#            done()
#
#    it.skip 'GET /api/v1/user/tasks (todos)', (done) ->
#      request.get("#{baseURL}/user/tasks")
#        .query(type:'todo')
#        .end (res) ->
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(res.body.err).to.be undefined
#            expect(res.statusCode).to.be 200
#            model.ref '_user', user
#            model.refList "_todoList", "_user.tasks", "_user.todoIds"
#            tasks = model.get("_todoList")
#            # Ensure that user owns the tasks
#            expect(res.body.length).to.equal tasks.length
#            # Ensure that the two sets are equal
#            expect(_.difference(_.pluck(res.body,'id'), _.pluck(tasks,'id')).length).to.equal 0
#            done()
#
#    it.skip 'DELETE /api/v1/user/task/:id', (done) ->
#      tid = currentUser.habitIds[2]
#      request.del("#{baseURL}/user/task/#{tid}")
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 204
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(user.get('habitIds').indexOf(tid)).to.be -1
#            expect(user.get("tasks.#{tid}")).to.be undefined
#            done()
#
#    it.skip 'DELETE /api/v1/user/task/:id (no task found)', (done) ->
#      tid = "adsfasdfjunkshouldntbeatask"
#      request.del("#{baseURL}/user/task/#{tid}")
#        .end (res) ->
#          expect(res.statusCode).to.be 400
#          expect(res.body.err).to.be 'No task found.'
#          done()
#
#    it.skip 'POST /api/v1/user/task/:id/up (habit)', (done) ->
#      tid = currentUser.habitIds[0]
#      request.post("#{baseURL}/user/task/#{tid}/up")
#        .send({})
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          expect(res.body).to.eql { gp: 1, exp: 7.5, lvl: 1, hp: 50, delta: 1 }
#          done()
#
#    it.skip 'POST /api/v1/user/task/:id/up (daily)', (done) ->
#      tid = currentUser.dailyIds[0]
#      request.post("#{baseURL}/user/task/#{tid}/up")
#        .send({})
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          expect(res.body).to.eql { gp: 2, exp: 15, lvl: 1, hp: 50, delta: 1 }
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expect(user.get("tasks.#{tid}.completed")).to.be true
#            done()
#
#    it.skip 'POST /api/v1/user/task (array)', (done) ->
#      habitId = currentUser.habitIds[0]
#      dailyId = currentUser.dailyIds[0]
#      arr = [{
#        id: habitId
#        text: 'hello'
#        notes: 'note'
#      },{
#        text: 'new task'
#        notes: 'notes!'
#      },{
#        id: dailyId
#        del: true
#      }]
#
#      request.post("#{baseURL}/user/tasks")
#        .send(arr)
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 201
#
#          expectSameValues res.body[0], {id: habitId,text: 'hello',notes: 'note'}, ['id','text','notes']
#          expect(res.body[1].id).to.be.a 'string'
#          expect(res.body[1].text).to.be 'new task'
#          expect(res.body[1].notes).to.be 'notes!'
#          expect(res.body[2]).to.eql deleted: true
#
#          query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#          query.fetch (err, user) ->
#            expectSameValues user.get("tasks.#{habitId}"), {id: habitId,text: 'hello',notes: 'note'}, ['id','text','notes']
#            expect(user.get("tasks.#{dailyId}")).to.be undefined
#            expectSameValues user.get("tasks.#{res.body[1].id}"), {id: res.body[1].id, text: 'new task', notes: 'notes!'}, ['id','text','notes']
#            done()
#
#    it.skip 'PUT /api/v1/user (bad path)', (done) ->
#      # These updates should not save, as per the API changes
#      userUpdates =
#        stats: hp: 30
#        flags: itemsEnabled: true
#        tasks: [{
#          text: 'hello2'
#          notes: 'note2'
#        }]
#
#      request.put("#{baseURL}/user")
#        .send(userUpdates)
#        .end (res) ->
#          expect(res.body.err).to.be.ok()
#          expect(res.statusCode).to.be 500
#          done()
#
#    it.skip 'PUT /api/v1/user', (done) ->
#      userBefore = {}
#      query = model.query('users').withIdAndToken(currentUser.id, currentUser.apiToken)
#      query.fetch (err, user) ->
#        userBefore = user.get()
#
#        habitId = currentUser.habitIds[0]
#        dailyId = currentUser.dailyIds[0]
#        updates = {}
#        updates['stats.hp'] = 30
#        updates['flags.itemsEnabled'] = true
#        updates["tasks.#{habitId}.text"] = 'hello2'
#        updates["tasks.#{habitId}.notes"] = 'note2'
#
#        request.put("#{baseURL}/user")
#          .send(updates)
#          .end (res) ->
#            expect(res.body.err).to.be undefined
#            expect(res.statusCode).to.be 200
#            changesWereMade = (obj) ->
#              expect(obj.stats.hp).to.be 30
#              expect(obj.flags.itemsEnabled).to.be true
#              expectSameValues _.find(obj.tasks,{id:habitId}), {id: habitId,text: 'hello2',notes: 'note2'}, ['id','text','notes']
#            changesWereMade res.body
#            query.fetch (err, user) ->
#              changesWereMade user.get()
#              done()
#
#    it.skip 'POST /api/v1/user/auth/local', (done) ->
#      userAuth = {username, password}
#      request.post("#{baseURL}/user/auth/local")
#        .set('Accept', 'application/json')
#        .send(userAuth)
#        .end (res) ->
#          expect(res.body.err).to.be undefined
#          expect(res.statusCode).to.be 200
#          expect(res.body.id).to.be currentUser.id
#          expect(res.body.token).to.be currentUser.apiToken
#          done()
#
#    it.skip 'POST /api/v1/user/auth/facebook', (done) ->
#      id = shared.uuid()
#      userAuth = facebook_id: 12345, name: 'Tyler Renelle', email: 'x@y.com'
#      newUser = helpers.newUser(true)
#      newUser.id = id
#      newUser.auth = facebook:
#        id: userAuth.facebook_id
#        name: userAuth.name
#        email: userAuth.email
#      model.set "users.#{id}", newUser, ->
#
#        request.post("#{baseURL}/user/auth/facebook")
#        .set('Accept', 'application/json')
#        .send(userAuth)
#        .end (res) ->
#            expect(res.body.err).to.be undefined
#            expect(res.statusCode).to.be 200
#            expect(res.body.id).to.be newUser.id
#            #expect(res.body.token).to.be newUser.apiToken
#            done()
#
#
