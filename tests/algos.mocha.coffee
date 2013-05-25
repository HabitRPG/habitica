_ = require 'lodash'
expect = require 'expect.js'
moment = require 'moment'

# Custom modules
algos = require '../script/algos'
helpers = require '../script/helpers'
items = require '../script/items'

### Helper Functions ####

expectStrings = (obj, paths) ->
  _.each paths, (path) -> expect(obj[path]).to.be.ok()

beforeAfter = (options={}) ->
  user = helpers.newUser()
  [before, after] = [_.cloneDeep(user), _.cloneDeep(user)]
  lastCron = +moment(options.now || +new Date).subtract('days', options.daysAgo) if options.daysAgo
  _.each [before,after], (obj) ->
    obj.lastCron = lastCron if options.daysAgo
  {before:before, after:after}
#TODO calculate actual poins

expectLostPoints = (before, after, taskType) ->
  if taskType in ['daily','habit']
    expect(after.stats.hp).to.be.lessThan before.stats.hp
    expect(_.size(after["#{taskType}s"][0].history)).to.be(1)
  else expect(_.size(after.history.todos)).to.be(1)
  expect(after.stats.exp).to.be 0
  expect(after.stats.gp).to.be 0
  expect(after["#{taskType}s"][0].value).to.be.lessThan before["#{taskType}s"][0].value

expectGainedPoints = (before, after, taskType) ->
  expect(after.stats.hp).to.be 50
  expect(after.stats.exp).to.be.greaterThan before.stats.exp
  expect(after.stats.gp).to.be.greaterThan before.stats.gp
  expect(after["#{taskType}s"][0].value).to.be.greaterThan before["#{taskType}s"][0].value
  if taskType in ['daily','habit']
    expect(_.size(after["#{taskType}s"][0].history)).to.be(1)
  # expect(after["#{taskType}s"].completed).to.be true if taskType in ['daily','todo']

###### Specs ######

describe 'User', ->
  it 'sets correct user defaults', ->
    user = helpers.newUser()
    expect(user.stats).to.eql { gp: 0, exp: 0, lvl: 1, hp: 50 }
    expect(user.party).to.eql { invitation: null }
    expect(user.items).to.eql { weapon: 0, armor: 0, head: 0, shield: 0 }
    expect(user.preferences).to.eql { gender: 'm', skin: 'white', hair: 'blond', armorSet: 'v1', dayStart:0, showHelm: true }
    expect(user.balance).to.eql 0
    expect(user.lastCron).to.eql 'new'
    expect(user.flags).to.eql {partyEnabled: false, itemsEnabled: false, ads: 'show'}
    expectStrings(user, ['apiToken'])
    expectStrings(user.habits[0], ['text','id'])
    expectStrings(user.dailys[0], ['text','id'])
    expectStrings(user.todos[0], ['text','id'])
    expectStrings(user.rewards[0], ['text','id'])
    expectStrings(user.tags[0], ['name','id'])
    expectStrings(user.tags[1], ['name','id'])
    expectStrings(user.tags[2], ['name','id'])

describe 'Simple Scoring', ->

  it 'Habits : Up', ->
    {before,after} = beforeAfter()
    algos.score(after, after.habits[0], 'down', {times:5})
    expectLostPoints(before,after,'habit')

  it 'Habits : Down', ->
    {before,after} = beforeAfter()
    algos.score(after, after.habits[0], 'up', {times:5})
    expectGainedPoints(before,after,'habit')

  it 'Dailys : Up', ->
    {before,after} = beforeAfter()
    algos.score(after, after.dailys[0], 'up')
    expectGainedPoints(before,after,'daily')

  it 'Todos : Up', ->
    {before,after} = beforeAfter()
    algos.score(after, after.todos[0], 'up')
    expectGainedPoints(before,after,'todo')

describe 'Cron', ->

  it 'computes shouldCron', ->
    user = helpers.newUser()
    expect(algos.shouldCron(user)).to.be true # handlomg lastCron='new'
    user.lastCron = moment().subtract('days',1)
    expect(algos.shouldCron(user)).to.be true

    user.lastCron = moment().add('days',1)
    expect(algos.shouldCron(user)).to.be false

  it 'only dailies & todos are effected', ->
    {before,after} = beforeAfter({daysAgo:1})
    before.dailys = before.todos = after.dailys = after.todos = []
    algos.cron(after)
    expect(after.lastCron).to.not.be before.lastCron # make sure cron was run
    expect(before.stats).to.eql after.stats
    beforeTasks = before.habits.concat(before.dailys).concat(before.todos).concat(before.rewards)
    afterTasks = after.habits.concat(after.dailys).concat(after.todos).concat(after.rewards)
    expect(beforeTasks).to.eql afterTasks

  describe 'Todos', ->
    it '1 day missed', ->
      {before,after} = beforeAfter({daysAgo:1})
      before.dailys = after.dailys = []
      algos.cron(after)

      # todos don't effect stats
      expect(after.stats.hp).to.be 50
      expect(after.stats.exp).to.be 0
      expect(after.stats.gp).to.be 0

      # but they devalue
      expect(after.todos[0].value).to.be.lessThan before.todos[0].value
      expect(_.size(after.history.todos)).to.be 1

  describe 'Dailies', ->

    it '1 day missed', ->
      {before,after} = beforeAfter({daysAgo:1})
      [before.dailys, after.dailys] = [ [before.dailys[0]], [after.dailys[0]] ]
      algos.cron(after)
      expectLostPoints(before,after,'daily')


    it 'due yesterday, custom day not started', ->
      now = moment().startOf('week')
      [before.dailys, after.dailys] = [ [before.dailys[0]], [after.dailys[0]] ]

      # due yesterday, but not today
      before.dailys[0].repeat = after.dailys[0].repeat = {su:0,m:1,t:1,w:1,th:1,f:1,s:1}
      {before,after} = beforeAfter({now, daysAgo:1})

      expectLostPoints(before,after,'daily') # todos don't effect stats

      # but they devalue
      expect(after.dailys[0].value).to.be.lessThan before.dailys[0].value
      expect(_.size(after.dailys[0].history)).to.be 1

    it 'due today, custom day not started'
    it 'checked yesterday, custom day not started'
    it 'checked yesterday, custom day started'

    it '1 day missed, not due'
    it '1 day missed, not day start yet'
    it '3 day missed, only 1 due'
    it '3 day missed, only 1 due, not day start yet'


  it 'calculates day differences with dayStart properly', ->
    dayStart = 4
    yesterday = moment().subtract('d', 1).add('h', dayStart)
    now = moment().startOf('day').add('h', dayStart-1) #today
    console.log {yesterday: yesterday.format('MM/DD HH:00'), now: now.format('MM/DD HH:00')}
    console.log {diff: Math.abs(moment(yesterday).diff(moment(now), 'days'))}
    expect(helpers.daysBetween(yesterday, now, dayStart)).to.eql 0
    now = moment().startOf('day').add('h', dayStart)
    console.log {now: now.format('MM/DD HH:00')}
    expect(helpers.daysBetween(yesterday, now, dayStart)).to.eql 1
