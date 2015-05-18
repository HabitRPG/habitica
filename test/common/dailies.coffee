_ = require 'lodash'
expect = require 'expect.js'
sinon = require 'sinon'
moment = require 'moment'
shared = require '../../common/script/index.coffee'
shared.i18n.translations = require('../../website/src/i18n.js').translations

repeatWithoutLastWeekday = ()->
  repeat = {su:1,m:1,t:1,w:1,th:1,f:1,s:1}
  if shared.startOfWeek(moment().zone(0)).isoWeekday() == 1 # Monday
    repeat.su = false
  else
    repeat.s = false
  {repeat: repeat}

### Helper Functions ####
# @TODO: Refactor into helper file
newUser = (addTasks=true)->
  buffs = {per:0, int:0, con:0, str:0, stealth: 0, streaks: false}
  user =
    auth:
      timestamps: {}
    stats: {str:1, con:1, per:1, int:1, mp: 32, class: 'warrior', buffs: buffs}
    items:
      lastDrop:
        count: 0
      hatchingPotions: {}
      eggs: {}
      food: {}
      gear:
        equipped: {}
        costume: {}
    party:
      quest:
        progress:
          down: 0
    preferences: {}
    dailys: []
    todos: []
    rewards: []
    flags: {}
    achievements: {}
    contributor:
      level: 2
  shared.wrap(user)
  user.ops.reset(null, ->)
  if addTasks
    _.each ['habit', 'todo', 'daily'], (task)->
      user.ops.addTask {body: {type: task, id: shared.uuid()}}
  user

cron = (usr) ->
  usr.lastCron = moment().subtract(1,'days')
  usr.fns.cron()

describe 'daily/weekly that repeats everyday (default)', ->
  user = null
  daily = null
  weekly = null

  describe 'when startDate is in the future', ->
    
    beforeEach ->
      user = newUser()
      user.dailys = [
        shared.taskDefaults({type:'daily', startDate: moment().add(7, 'days'), frequency: 'daily'})
        shared.taskDefaults({type:'daily', startDate: moment().add(7, 'days'), frequency: 'weekly', repeat: {su:1,m:1,t:1,w:1,th:1,f:1,s:1}})
      ]
      daily = user.dailys[0]
      weekly = user.dailys[1]

    it 'does not damage user for not completing it', ->
      cron(user)
      expect(user.stats.hp).to.be 50

    it 'does not change value on cron if daily is incomplete', ->
      cron(user)
      expect(daily.value).to.be 0
      expect(weekly.value).to.be 0

    it 'does not reset checklists if daily is not marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      weekly.checklist = checklist
      cron(user)

      expect(daily.checklist[0].completed).to.be true
      expect(daily.checklist[1].completed).to.be true
      expect(daily.checklist[2].completed).to.be false

      expect(weekly.checklist[0].completed).to.be true
      expect(weekly.checklist[1].completed).to.be true
      expect(weekly.checklist[2].completed).to.be false

    it 'resets checklists if daily is marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      weekly.checklist = checklist
      daily.completed = true
      weekly.completed = true
      cron(user)

      _.each daily.checklist, (box)->
        expect(box.completed).to.be false

      _.each weekly.checklist, (box)->
        expect(box.completed).to.be false

    it 'is due on startDate', ->
      daily_due_today = shared.shouldDo moment(), daily
      daily_due_on_start_date = shared.shouldDo moment().add(7, 'days'), daily
 
      expect(daily_due_today).to.be false
      expect(daily_due_on_start_date).to.be true

      weekly_due_today = shared.shouldDo moment(), weekly
      weekly_due_on_start_date = shared.shouldDo moment().add(7, 'days'), weekly
 
      expect(weekly_due_today).to.be false
      expect(weekly_due_on_start_date).to.be true

  describe 'when startDate is in the past', ->
    completeDaily = null
    
    beforeEach ->
      user = newUser()
      user.dailys = [
        shared.taskDefaults({type:'daily', startDate: moment().subtract(7, 'days'), frequency: 'daily'})
        shared.taskDefaults({type:'daily', startDate: moment().subtract(7, 'days'), frequency: 'weekly'})
      ]
      daily = user.dailys[0]
      weekly = user.dailys[1]

    it 'does damage user for not completing it', ->
      cron(user)
      expect(user.stats.hp).to.be.lessThan 50

    it 'decreases value on cron if daily is incomplete', ->
      cron(user)
      expect(daily.value).to.be.lessThan 0
      expect(weekly.value).to.be.lessThan 0

    it 'resets checklists if daily is not marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      weekly.checklist = checklist
      cron(user)

      _.each daily.checklist, (box)->
        expect(box.completed).to.be false
      
      _.each weekly.checklist, (box)->
        expect(box.completed).to.be false

    it 'resets checklists if daily is marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      daily.completed = true
      weekly.checklist = checklist
      weekly.completed = true
      cron(user)

      _.each daily.checklist, (box)->
        expect(box.completed).to.be false

      _.each weekly.checklist, (box)->
        expect(box.completed).to.be false

  describe 'when startDate is today', ->
    completeDaily = null
    
    beforeEach ->
      user = newUser()
      user.dailys = [
        # Must set start date to yesterday, because cron mock sets last cron to yesterday
        shared.taskDefaults({type:'daily', startDate: moment().subtract(1, 'days'), frequency: 'daily'})
        shared.taskDefaults({type:'daily', startDate: moment().subtract(1, 'days'), frequency: 'weekly'})
      ]
      daily = user.dailys[0]
      weekly = user.dailys[1]

    it 'does damage user for not completing it', ->
      cron(user)
      expect(user.stats.hp).to.be.lessThan 50

    it 'decreases value on cron if daily is incomplete', ->
      cron(user)
      expect(daily.value).to.be.lessThan 0
      expect(weekly.value).to.be.lessThan 0

    it 'resets checklists if daily is not marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      weekly.checklist = checklist
      cron(user)

      _.each daily.checklist, (box)->
        expect(box.completed).to.be false
      
      _.each weekly.checklist, (box)->
        expect(box.completed).to.be false

    it 'resets checklists if daily is marked as complete', ->
      checklist = [
        {
          'text' : '1',
          'id' : 'checklist-one',
          'completed' : true
        },
        {
          'text' : '2',
          'id' : 'checklist-two',
          'completed' : true
        },
        {
          'text' : '3',
          'id' : 'checklist-three',
          'completed' : false
        }
      ]
      daily.checklist = checklist
      daily.completed = true
      weekly.checklist = checklist
      weekly.completed = true
      cron(user)

      _.each daily.checklist, (box)->
        expect(box.completed).to.be false

      _.each weekly.checklist, (box)->
        expect(box.completed).to.be false

describe 'daily that repeats every x days', ->
  user = null
  daily = null

  beforeEach ->
    user = newUser()
    user.dailys = [ shared.taskDefaults({type:'daily', startDate: moment(), frequency: 'daily'}) ]
    daily = user.dailys[0]

  _.times 10, (n) ->
    due = n + 1

    it 'where x equals ' + due, ->
      daily.everyX = due

      _.times 100, (day) ->
        isDue = shared.shouldDo moment().add(day, 'days'), daily
        expect(isDue).to.be true if day % due == 0
        expect(isDue).to.be false if day % due != 0

describe 'weekly that repeats on M,W,F every x days', ->
  user = null
  weekly = null
  start_date = moment()

  beforeEach ->
    user = newUser()
    user.dailys = [ shared.taskDefaults({type:'daily', startDate: start_date, frequency: 'weekly', repeat: {su:false,m:1,t:false,w:1,th:false,f:1,s:false}}) ]
    weekly = user.dailys[0]

  _.times 10, (n) ->
    due = n + 1

    it 'where x equals ' + due, ->
      weekly.everyX = due
      _.times 100, (day) ->
        valid_days = { Mon: true, Wed: true, Fri: true }
        day_to_test = start_date.add(day, 'days')
        day_of_week = moment(day_to_test).format('ddd')
        
        isDue = shared.shouldDo day_to_test, weekly
        is_correct_week = shared.numWeeksApart(day_to_test, start_date) % due == 0

        if valid_days[day_of_week] && is_correct_week
          expect(isDue).to.be true
        else
          expect(isDue).to.be false
