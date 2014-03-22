### Install: npm install --dev ###
### Run: npm test ###

_ = require 'lodash'
expect = require 'expect.js'
sinon = require 'sinon'
moment = require 'moment'
shared = require '../script/index.coffee'
test_helper = require './test_helper'
test_helper.addCustomMatchers()
$w = (s)->s.split(' ')

### Helper Functions ####
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

rewrapUser = (user)->
  user._wrapped = false
  shared.wrap(user)
  user

expectStrings = (obj, paths) ->
  _.each paths, (path) -> expect(obj[path]).to.be.ok()

# options.daysAgo: days ago when the last cron was executed
beforeAfter = (options={}) ->
  user = newUser()
  [before, after] = [user, _.cloneDeep(user)]
  # avoid closure on the original user
  rewrapUser(after)
  before.preferences.dayStart = after.preferences.dayStart = options.dayStart if options.dayStart
  before.preferences.timezoneOffset = after.preferences.timezoneOffset = (options.timezoneOffset or moment().zone())
  if options.limitOne
    before["#{options.limitOne}s"] = [before["#{options.limitOne}s"][0]]
    after["#{options.limitOne}s"] = [after["#{options.limitOne}s"][0]]
  lastCron = +(moment(options.now || +new Date).subtract('days', options.daysAgo)) if options.daysAgo
  _.each [before,after], (obj) ->
    obj.lastCron = lastCron if options.daysAgo
  {before:before, after:after}
#TODO calculate actual poins

expectLostPoints = (before, after, taskType) ->
  if taskType in ['daily','habit']
    expect(after.stats.hp).to.be.lessThan before.stats.hp
    expect(after["#{taskType}s"][0].history).to.have.length(1)
  else expect(after.history.todos).to.have.length(1)
  expect(after).toHaveExp 0
  expect(after).toHaveGP 0
  expect(after["#{taskType}s"][0].value).to.be.lessThan before["#{taskType}s"][0].value

expectGainedPoints = (before, after, taskType) ->
  expect(after.stats.hp).to.be 50
  expect(after.stats.exp).to.be.greaterThan before.stats.exp
  expect(after.stats.gp).to.be.greaterThan before.stats.gp
  expect(after["#{taskType}s"][0].value).to.be.greaterThan before["#{taskType}s"][0].value
  expect(after["#{taskType}s"][0].history).to.have.length(1) if taskType is 'habit'
  # daily & todo histories handled on cron

expectNoChange = (before,after) ->
  _.each $w('stats items gear dailys todos rewards flags preferences'), (attr)->
    expect(after[attr]).to.eql before[attr]

expectDayResetNoDamage = (b,a) ->
  [before,after] = [_.cloneDeep(b), _.cloneDeep(a)]
  _.each after.dailys, (task,i) ->
    expect(task.completed).to.be false
    expect(before.dailys[i].value).to.be task.value
    expect(before.dailys[i].streak).to.be task.streak
    expect(task.history).to.have.length(1)
  _.each after.todos, (task,i) ->
    expect(task.completed).to.be false
    expect(before.todos[i].value).to.be.greaterThan task.value
  expect(after.history.todos).to.have.length(1)
  # hack so we can compare user before/after obj equality sans effected paths
  _.each [before,after], (obj) ->
    delete obj.stats.buffs
    _.each $w('dailys todos history lastCron'), (path) -> delete obj[path]
  delete after._tmp
  expectNoChange(before, after)

cycle = (array)->
  n = -1
  (seed=0)->
    n++
    return array[n % array.length]

repeatWithoutLastWeekday = ()->
  repeat = {su:1,m:1,t:1,w:1,th:1,f:1,s:1}
  if shared.startOfWeek(moment().zone(0)).isoWeekday() == 1 # Monday
    repeat.su = false
  else
    repeat.s = false
  {repeat: repeat}

###### Specs ######

describe 'User', ->
  it 'sets correct user defaults', ->
    user = newUser()
    base_gear = { armor: 'armor_base_0', weapon: 'weapon_base_0', head: 'head_base_0', shield: 'shield_base_0' }
    buffs = {per:0, int:0, con:0, str:0, stealth: 0, streaks: false}
    expect(user.stats).to.eql { str: 1, con: 1, per: 1, int: 1, hp: 50, mp: 32, lvl: 1, exp: 0, gp: 0, class: 'warrior', buffs: buffs }
    expect(user.items.gear).to.eql { equipped: base_gear, costume: base_gear, owned: {weapon_warrior_0: true} }
    expect(user.preferences).to.eql { costume: false }

  it 'calculates max MP', ->
    user = newUser()
    expect(user).toHaveMaxMP 32
    user.stats.int = 10
    expect(user).toHaveMaxMP 50
    user.stats.lvl = 5
    expect(user).toHaveMaxMP 54
    user.stats.class = 'wizard'
    user.items.gear.equipped.weapon = 'weapon_wizard_1'
    expect(user).toHaveMaxMP 63

  it 'handles perfect days', ->
    user = newUser()
    user.dailys = []
    _.times 3, ->user.dailys.push shared.taskDefaults({type:'daily'})
    cron = -> user.lastCron = moment().subtract('days',1);user.fns.cron()

    cron()
    expect(user.stats.buffs.str).to.be 0
    expect(user.achievements.perfect).to.not.be.ok

    user.dailys[0].completed = true
    cron()
    expect(user.stats.buffs.str).to.be 0
    expect(user.achievements.perfect).to.not.be.ok

    _.each user.dailys, (d)->d.completed = true
    cron()
    expect(user.stats.buffs.str).to.be 1
    expect(user.achievements.perfect).to.be 1

    # Handle greyed-out dailys
    yesterday = moment().subtract('days',1);
    user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = 0
    _.each user.dailys[1..], (d)->d.completed = true
    cron()
    expect(user.stats.buffs.str).to.be 1
    expect(user.achievements.perfect).to.be 2


  describe 'Death', ->
    user = undefined
    it 'revives correctly', ->
      user = newUser()
      user.stats = { gp: 10, exp: 100, lvl: 2, hp: 1 }
      user.ops.revive()
      expect(user).toHaveGP 0
      expect(user).toHaveExp 0
      expect(user).toHaveLevel 1
      expect(user).toHaveHP 50
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: false }

    it "doesn't break unbreakables", ->
      ce = shared.countExists
      user = newUser()
      user.items.gear.owned['shield_rogue_1'] = true
      user.items.gear.owned['head_special_nye'] = true
      expect(ce user.items.gear.owned).to.be 3
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 2
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 1
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 0

    it "handles event items", ->
      shared.content.gear.flat.head_special_nye.event.start = '2012-01-01'
      shared.content.gear.flat.head_special_nye.event.end = '2012-02-01'
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be true
      delete user.items.gear.owned['head_special_nye']
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be false

      shared.content.gear.flat.head_special_nye.event.start = moment().subtract('days',5)
      shared.content.gear.flat.head_special_nye.event.end = moment().add('days',5)
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be true


  describe 'store', ->
    it 'recovers hp buying potions', ->
      user = newUser()
      user.stats.hp = 30
      user.stats.gp = 50
      user.ops.buy {params: {key: 'potion'}}
      expect(user).toHaveHP 45
      expect(user).toHaveGP 25

      user.ops.buy {params: {key: 'potion'}}
      expect(user).toHaveHP 50 # don't exceed max hp
      expect(user).toHaveGP 0

    it 'buys equipment', ->
      user = newUser()
      user.stats.gp = 31
      user.ops.buy {params: {key: 'armor_warrior_1'}}
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: true, armor_warrior_1: true }
      expect(user.items.gear.equipped).to.eql { armor: 'armor_warrior_1', weapon: 'weapon_base_0', head: 'head_base_0', shield: 'shield_base_0' }
      expect(user).toHaveGP 1

    it 'do not buy equipment without enough money', ->
      user = newUser()
      user.stats.gp = 1
      user.ops.buy {params: {key: 'armor_warrior_1'}}
      expect(user.items.gear.equipped).to.eql { armor: 'armor_base_0', weapon: 'weapon_base_0', head: 'head_base_0', shield: 'shield_base_0' }
      expect(user).toHaveGP 1

  describe 'spells', ->
    _.each shared.content.spells, (spellClass)->
      _.each spellClass, (spell)->
        it "#{spell.text} has valid values", ->
          expect(spell.target).to.match(/^(task|self|party|user)$/)
          expect(spell.mana).to.be.an('number')
          if spell.lvl
            expect(spell.lvl).to.be.an('number')
            expect(spell.lvl).to.be.above(0)
          expect(spell.cast).to.be.a('function')


  describe 'drop system', ->
    user = null

    beforeEach ->
      user = newUser()
      user.flags.dropsEnabled = true
      # too many predictableRandom calls to stub, let's return the last element
      sinon.stub(user.fns, 'randomVal', (obj)->
        result = undefined
        for key, val of obj
          result = val
        result
      )
      @task_id = shared.uuid()
      user.ops.addTask({body: {type: 'daily', id: @task_id}})

    it 'gets a golden potion', ->
      sinon.stub(user.fns, 'predictableRandom').returns 0
      user.ops.score {params: { id: @task_id, direction: 'up'}}
      expect(user.items.eggs).to.eql {}
      expect(user.items.hatchingPotions).to.eql {'Golden': 1}
      expect(user.items.food).to.eql {}

    it 'gets a bear cub egg', ->
      sinon.stub(user.fns, 'predictableRandom', cycle [0, 0, 0.55])
      user.ops.score {params: { id: @task_id, direction: 'up'}}
      expect(user.items.eggs).to.eql {'BearCub': 1}
      expect(user.items.hatchingPotions).to.eql {}
      expect(user.items.food).to.eql {}

    it 'gets honey', ->
      sinon.stub(user.fns, 'predictableRandom', cycle [0, 0, 0.9])
      user.ops.score {params: { id: @task_id, direction: 'up'}}
      expect(user.items.eggs).to.eql {}
      expect(user.items.hatchingPotions).to.eql {}
      expect(user.items.food).to.eql {'Honey': 1}

    it 'does not get a drop', ->
      sinon.stub(user.fns, 'predictableRandom').returns 0.5
      user.ops.score {params: { id: @task_id, direction: 'up'}}
      expect(user.items.eggs).to.eql {}
      expect(user.items.hatchingPotions).to.eql {}
      expect(user.items.food).to.eql {}

    afterEach ->
      user.fns.randomVal.restore()
      user.fns.predictableRandom.restore()


  describe 'Quests', ->
    _.each shared.content.quests, (quest)->
      it "#{quest.text} has valid values", ->
        expect(quest.notes).to.be.an('string')
        expect(quest.completion).to.be.an('string') if quest.completion
        expect(quest.previous).to.be.an('string') if quest.previous
        expect(quest.value).to.be.greaterThan 0
        expect(quest.drop.gp).to.be.greaterThan 0
        expect(quest.drop.exp).to.be.greaterThan 0
        expect(quest.drop.items).to.be.an(Array)
        if quest.boss
          expect(quest.boss.name).to.be.an('string')
          expect(quest.boss.hp).to.be.greaterThan 0
          expect(quest.boss.str).to.be.greaterThan 0
        else if quest.collect
          _.each quest.collect, (collect)->
            expect(collect.text).to.be.an('string')
            expect(collect.count).to.be.greaterThan 0

  describe 'Achievements', ->
    _.each shared.content.classes, (klass) ->
      user = newUser()
      user.stats.gp = 10000
      _.each shared.content.gearTypes, (type) ->
        _.each [1..5], (i) ->
          user.ops.buy {params:'#{type}_#{klass}_#{i}'}
      it 'does not get ultimateGear ' + klass, ->
        expect(user.achievements.ultimateGear).to.not.be.ok
      _.each shared.content.gearTypes, (type) ->
        user.ops.buy {params:'#{type}_#{klass}_6'}
      it 'gets ultimateGear ' + klass, ->
        expect(user.achievements.ultimateGear).to.be.ok

    it 'doesnt get beastmaster', ->
      user = newUser()
      user.items.pets = {'Wolf-White': 1, 'Wolf-Desert': 1, 'Wolf-Red': 1, 'Wolf-Shade': 1, 'Wolf-Skeleton': 1, 'Wolf-Zombie': 1, 'Wolf-CottonCandyPink': 1, 'Wolf-CottonCandyBlue': 1, 'Wolf-Golden': 1, 'TigerCub-Base': 1, 'TigerCub-White': 1, 'TigerCub-Desert': 1, 'TigerCub-Red': 1, 'TigerCub-Shade': 1, 'TigerCub-Skeleton': 1, 'TigerCub-Zombie': 1, 'TigerCub-CottonCandyPink': 1, 'TigerCub-CottonCandyBlue': 1, 'TigerCub-Golden': 1, 'PandaCub-Base': 1, 'PandaCub-White': 1, 'PandaCub-Desert': 1, 'PandaCub-Red': 1, 'PandaCub-Shade': 1, 'PandaCub-Skeleton': 1, 'PandaCub-Zombie': 1, 'PandaCub-CottonCandyPink': 1, 'PandaCub-CottonCandyBlue': 1, 'PandaCub-Golden': 1, 'LionCub-Base': 1, 'LionCub-White': 1, 'LionCub-Desert': 1, 'LionCub-Red': 1, 'LionCub-Shade': 1, 'LionCub-Skeleton': 1, 'LionCub-Zombie': 1, 'LionCub-CottonCandyPink': 1, 'LionCub-CottonCandyBlue': 1, 'LionCub-Golden': 1, 'Fox-Base': 1, 'Fox-White': 1, 'Fox-Desert': 1, 'Fox-Red': 1, 'Fox-Shade': 1, 'Fox-Skeleton': 1, 'Fox-Zombie': 1, 'Fox-CottonCandyPink': 1, 'Fox-CottonCandyBlue': 1, 'Fox-Golden': 1, 'FlyingPig-Base': 1, 'FlyingPig-White': 1, 'FlyingPig-Desert': 1, 'FlyingPig-Red': 1, 'FlyingPig-Shade': 1, 'FlyingPig-Skeleton': 1, 'FlyingPig-Zombie': 1, 'FlyingPig-CottonCandyPink': 1, 'FlyingPig-CottonCandyBlue': 1, 'FlyingPig-Golden': 1, 'Dragon-Base': 1, 'Dragon-White': 1, 'Dragon-Desert': 1, 'Dragon-Red': 1, 'Dragon-Shade': 1, 'Dragon-Skeleton': 1, 'Dragon-Zombie': 1, 'Dragon-CottonCandyPink': 1, 'Dragon-CottonCandyBlue': 1, 'Dragon-Golden': 1, 'Cactus-Base': 1, 'Cactus-White': 1, 'Cactus-Desert': 1, 'Cactus-Red': 1, 'Cactus-Shade': 1, 'Cactus-Skeleton': 1, 'Cactus-Zombie': 1, 'Cactus-CottonCandyPink': 1, 'Cactus-CottonCandyBlue': 1, 'Cactus-Golden': 1, 'BearCub-Base': 1, 'BearCub-White': 1, 'BearCub-Desert': 1, 'BearCub-Red': 1, 'BearCub-Shade': 1, 'BearCub-Skeleton': 1, 'BearCub-Zombie': 1, 'BearCub-CottonCandyPink': 1, 'BearCub-CottonCandyBlue': 1, 'BearCub-Golden': 1 }
      expect(shared.countPets(null,user.items.pets)).to.eql 89
      expect(shared.countPets(_.size(user.items.pets), user.items.pets)).to.eql 89
      expect(user.achievements.beastMaster).to.not.be.ok

    it 'doesnt get beastmaster with gryphons', ->
      user = newUser()
      user.items.pets = {'Gryphon-Base': 1, 'Wolf-White': 1, 'Wolf-Desert': 1, 'Wolf-Red': 1, 'Wolf-Shade': 1, 'Wolf-Skeleton': 1, 'Wolf-Zombie': 1, 'Wolf-CottonCandyPink': 1, 'Wolf-CottonCandyBlue': 1, 'Wolf-Golden': 1, 'TigerCub-Base': 1, 'TigerCub-White': 1, 'TigerCub-Desert': 1, 'TigerCub-Red': 1, 'TigerCub-Shade': 1, 'TigerCub-Skeleton': 1, 'TigerCub-Zombie': 1, 'TigerCub-CottonCandyPink': 1, 'TigerCub-CottonCandyBlue': 1, 'TigerCub-Golden': 1, 'PandaCub-Base': 1, 'PandaCub-White': 1, 'PandaCub-Desert': 1, 'PandaCub-Red': 1, 'PandaCub-Shade': 1, 'PandaCub-Skeleton': 1, 'PandaCub-Zombie': 1, 'PandaCub-CottonCandyPink': 1, 'PandaCub-CottonCandyBlue': 1, 'PandaCub-Golden': 1, 'LionCub-Base': 1, 'LionCub-White': 1, 'LionCub-Desert': 1, 'LionCub-Red': 1, 'LionCub-Shade': 1, 'LionCub-Skeleton': 1, 'LionCub-Zombie': 1, 'LionCub-CottonCandyPink': 1, 'LionCub-CottonCandyBlue': 1, 'LionCub-Golden': 1, 'Fox-Base': 1, 'Fox-White': 1, 'Fox-Desert': 1, 'Fox-Red': 1, 'Fox-Shade': 1, 'Fox-Skeleton': 1, 'Fox-Zombie': 1, 'Fox-CottonCandyPink': 1, 'Fox-CottonCandyBlue': 1, 'Fox-Golden': 1, 'FlyingPig-Base': 1, 'FlyingPig-White': 1, 'FlyingPig-Desert': 1, 'FlyingPig-Red': 1, 'FlyingPig-Shade': 1, 'FlyingPig-Skeleton': 1, 'FlyingPig-Zombie': 1, 'FlyingPig-CottonCandyPink': 1, 'FlyingPig-CottonCandyBlue': 1, 'FlyingPig-Golden': 1, 'Dragon-Base': 1, 'Dragon-White': 1, 'Dragon-Desert': 1, 'Dragon-Red': 1, 'Dragon-Shade': 1, 'Dragon-Skeleton': 1, 'Dragon-Zombie': 1, 'Dragon-CottonCandyPink': 1, 'Dragon-CottonCandyBlue': 1, 'Dragon-Golden': 1, 'Cactus-Base': 1, 'Cactus-White': 1, 'Cactus-Desert': 1, 'Cactus-Red': 1, 'Cactus-Shade': 1, 'Cactus-Skeleton': 1, 'Cactus-Zombie': 1, 'Cactus-CottonCandyPink': 1, 'Cactus-CottonCandyBlue': 1, 'Cactus-Golden': 1, 'BearCub-Base': 1, 'BearCub-White': 1, 'BearCub-Desert': 1, 'BearCub-Red': 1, 'BearCub-Shade': 1, 'BearCub-Skeleton': 1, 'BearCub-Zombie': 1, 'BearCub-CottonCandyPink': 1, 'BearCub-CottonCandyBlue': 1, 'BearCub-Golden': 1 }
      expect(shared.countPets(null,user.items.pets)).to.eql 89
      expect(shared.countPets(_.size(user.items.pets), user.items.pets)).to.eql 89
      expect(user.achievements.beastMaster).to.not.be.ok

    it 'doesnt get beastmaster with hydra', ->
      user = newUser()
      user.items.pets = {'Dragon-Hydra': 1, 'Wolf-White': 1, 'Wolf-Desert': 1, 'Wolf-Red': 1, 'Wolf-Shade': 1, 'Wolf-Skeleton': 1, 'Wolf-Zombie': 1, 'Wolf-CottonCandyPink': 1, 'Wolf-CottonCandyBlue': 1, 'Wolf-Golden': 1, 'TigerCub-Base': 1, 'TigerCub-White': 1, 'TigerCub-Desert': 1, 'TigerCub-Red': 1, 'TigerCub-Shade': 1, 'TigerCub-Skeleton': 1, 'TigerCub-Zombie': 1, 'TigerCub-CottonCandyPink': 1, 'TigerCub-CottonCandyBlue': 1, 'TigerCub-Golden': 1, 'PandaCub-Base': 1, 'PandaCub-White': 1, 'PandaCub-Desert': 1, 'PandaCub-Red': 1, 'PandaCub-Shade': 1, 'PandaCub-Skeleton': 1, 'PandaCub-Zombie': 1, 'PandaCub-CottonCandyPink': 1, 'PandaCub-CottonCandyBlue': 1, 'PandaCub-Golden': 1, 'LionCub-Base': 1, 'LionCub-White': 1, 'LionCub-Desert': 1, 'LionCub-Red': 1, 'LionCub-Shade': 1, 'LionCub-Skeleton': 1, 'LionCub-Zombie': 1, 'LionCub-CottonCandyPink': 1, 'LionCub-CottonCandyBlue': 1, 'LionCub-Golden': 1, 'Fox-Base': 1, 'Fox-White': 1, 'Fox-Desert': 1, 'Fox-Red': 1, 'Fox-Shade': 1, 'Fox-Skeleton': 1, 'Fox-Zombie': 1, 'Fox-CottonCandyPink': 1, 'Fox-CottonCandyBlue': 1, 'Fox-Golden': 1, 'FlyingPig-Base': 1, 'FlyingPig-White': 1, 'FlyingPig-Desert': 1, 'FlyingPig-Red': 1, 'FlyingPig-Shade': 1, 'FlyingPig-Skeleton': 1, 'FlyingPig-Zombie': 1, 'FlyingPig-CottonCandyPink': 1, 'FlyingPig-CottonCandyBlue': 1, 'FlyingPig-Golden': 1, 'Dragon-Base': 1, 'Dragon-White': 1, 'Dragon-Desert': 1, 'Dragon-Red': 1, 'Dragon-Shade': 1, 'Dragon-Skeleton': 1, 'Dragon-Zombie': 1, 'Dragon-CottonCandyPink': 1, 'Dragon-CottonCandyBlue': 1, 'Dragon-Golden': 1, 'Cactus-Base': 1, 'Cactus-White': 1, 'Cactus-Desert': 1, 'Cactus-Red': 1, 'Cactus-Shade': 1, 'Cactus-Skeleton': 1, 'Cactus-Zombie': 1, 'Cactus-CottonCandyPink': 1, 'Cactus-CottonCandyBlue': 1, 'Cactus-Golden': 1, 'BearCub-Base': 1, 'BearCub-White': 1, 'BearCub-Desert': 1, 'BearCub-Red': 1, 'BearCub-Shade': 1, 'BearCub-Skeleton': 1, 'BearCub-Zombie': 1, 'BearCub-CottonCandyPink': 1, 'BearCub-CottonCandyBlue': 1, 'BearCub-Golden': 1 }
      expect(shared.countPets(null,user.items.pets)).to.eql 89
      expect(shared.countPets(_.size(user.items.pets), user.items.pets)).to.eql 89
      expect(user.achievements.beastMaster).to.not.be.ok

    it 'does get beastmaster', ->
      user = newUser()
      user.items.pets = {'Wolf-Base': 1, 'Wolf-White': 1, 'Wolf-Desert': 1, 'Wolf-Red': 1, 'Wolf-Shade': 1, 'Wolf-Skeleton': 1, 'Wolf-Zombie': 1, 'Wolf-CottonCandyPink': 1, 'Wolf-CottonCandyBlue': 1, 'Wolf-Golden': 1, 'TigerCub-Base': 1, 'TigerCub-White': 1, 'TigerCub-Desert': 1, 'TigerCub-Red': 1, 'TigerCub-Shade': 1, 'TigerCub-Skeleton': 1, 'TigerCub-Zombie': 1, 'TigerCub-CottonCandyPink': 1, 'TigerCub-CottonCandyBlue': 1, 'TigerCub-Golden': 1, 'PandaCub-Base': 1, 'PandaCub-White': 1, 'PandaCub-Desert': 1, 'PandaCub-Red': 1, 'PandaCub-Shade': 1, 'PandaCub-Skeleton': 1, 'PandaCub-Zombie': 1, 'PandaCub-CottonCandyPink': 1, 'PandaCub-CottonCandyBlue': 1, 'PandaCub-Golden': 1, 'LionCub-Base': 1, 'LionCub-White': 1, 'LionCub-Desert': 1, 'LionCub-Red': 1, 'LionCub-Shade': 1, 'LionCub-Skeleton': 1, 'LionCub-Zombie': 1, 'LionCub-CottonCandyPink': 1, 'LionCub-CottonCandyBlue': 1, 'LionCub-Golden': 1, 'Fox-Base': 1, 'Fox-White': 1, 'Fox-Desert': 1, 'Fox-Red': 1, 'Fox-Shade': 1, 'Fox-Skeleton': 1, 'Fox-Zombie': 1, 'Fox-CottonCandyPink': 1, 'Fox-CottonCandyBlue': 1, 'Fox-Golden': 1, 'FlyingPig-Base': 1, 'FlyingPig-White': 1, 'FlyingPig-Desert': 1, 'FlyingPig-Red': 1, 'FlyingPig-Shade': 1, 'FlyingPig-Skeleton': 1, 'FlyingPig-Zombie': 1, 'FlyingPig-CottonCandyPink': 1, 'FlyingPig-CottonCandyBlue': 1, 'FlyingPig-Golden': 1, 'Dragon-Base': 1, 'Dragon-White': 1, 'Dragon-Desert': 1, 'Dragon-Red': 1, 'Dragon-Shade': 1, 'Dragon-Skeleton': 1, 'Dragon-Zombie': 1, 'Dragon-CottonCandyPink': 1, 'Dragon-CottonCandyBlue': 1, 'Dragon-Golden': 1, 'Cactus-Base': 1, 'Cactus-White': 1, 'Cactus-Desert': 1, 'Cactus-Red': 1, 'Cactus-Shade': 1, 'Cactus-Skeleton': 1, 'Cactus-Zombie': 1, 'Cactus-CottonCandyPink': 1, 'Cactus-CottonCandyBlue': 1, 'Cactus-Golden': 1, 'BearCub-Base': 1, 'BearCub-White': 1, 'BearCub-Desert': 1, 'BearCub-Red': 1, 'BearCub-Shade': 1, 'BearCub-Skeleton': 1, 'BearCub-Zombie': 1, 'BearCub-CottonCandyPink': 1, 'BearCub-CottonCandyBlue': 1, 'BearCub-Golden': 1 }
      expect(shared.countPets(null,user.items.pets)).to.eql 90
      expect(shared.countPets(_.size(user.items.pets), user.items.pets)).to.eql 90
      expect(user.achievements.beastMaster).to.be.ok

describe 'Simple Scoring', ->
  beforeEach ->
    {@before, @after} = beforeAfter()

  it 'Habits : Up', ->
    @after.ops.score {params: {id: @after.habits[0].id, direction: 'down'}, query: {times: 5}}
    expectLostPoints(@before, @after,'habit')

  it 'Habits : Down', ->
    @after.ops.score {params: {id: @after.habits[0].id, direction: 'up'}, query: {times: 5}}
    expectGainedPoints(@before, @after,'habit')

  it 'Dailys : Up', ->
    @after.ops.score {params: {id: @after.dailys[0].id, direction: 'up'}}
    expectGainedPoints(@before, @after,'daily')

  it 'Todos : Up', ->
    @after.ops.score {params: {id: @after.todos[0].id, direction: 'up'}}
    expectGainedPoints(@before, @after,'todo')

describe 'Cron', ->

  it 'computes shouldCron', ->
    user = newUser()

    paths = {};user.fns.cron {paths}
    expect(user.lastCron).to.not.be.ok # it setup the cron property now

    user.lastCron = +moment().subtract('days',1)
    paths = {};user.fns.cron {paths}
    expect(user.lastCron).to.be.greaterThan 0

#    user.lastCron = +moment().add('days',1)
#    paths = {};algos.cron user, {paths}
#    expect(paths.lastCron).to.be true # busted cron (was set to after today's date)

  it 'only dailies & todos are effected', ->
    {before,after} = beforeAfter({daysAgo:1})
    before.dailys = before.todos = after.dailys = after.todos = []
    after.fns.cron()
    expect(after.lastCron).to.not.be before.lastCron # make sure cron was run
    delete after.stats.buffs;delete before.stats.buffs
    expect(before.stats).to.eql after.stats
    beforeTasks = before.habits.concat(before.dailys).concat(before.todos).concat(before.rewards)
    afterTasks = after.habits.concat(after.dailys).concat(after.todos).concat(after.rewards)
    expect(beforeTasks).to.eql afterTasks

  describe 'preening', ->
    beforeEach ->
      @clock = sinon.useFakeTimers(Date.parse("2013-11-20"), "Date");

    afterEach ->
      @clock.restore()

    it 'should preen user history', ->
      {before,after} = beforeAfter({daysAgo:1})
      history = [
        # Last year should be condensed to one entry, avg: 1
        {date:'09/01/2012', value: 0}
        {date:'10/01/2012', value: 0}
        {date:'11/01/2012', value: 2}
        {date:'12/01/2012', value: 2}

        # Each month of this year should be condensed to 1/mo, averages follow
        {date:'01/01/2013', value: 1} #2
        {date:'01/15/2013', value: 3}

        {date:'02/01/2013', value: 2} #3
        {date:'02/15/2013', value: 4}

        {date:'03/01/2013', value: 3} #4
        {date:'03/15/2013', value: 5}

        {date:'04/01/2013', value: 4} #5
        {date:'04/15/2013', value: 6}

        {date:'05/01/2013', value: 5} #6
        {date:'05/15/2013', value: 7}

        {date:'06/01/2013', value: 6} #7
        {date:'06/15/2013', value: 8}

        {date:'07/01/2013', value: 7} #8
        {date:'07/15/2013', value: 9}

        {date:'08/01/2013', value: 8} #9
        {date:'08/15/2013', value: 10}

        {date:'09/01/2013', value: 9} #10
        {date:'09/15/2013', value: 11}

        {date:'010/01/2013', value: 10} #11
        {date:'010/15/2013', value: 12}

        # This month should condense each week
        {date:'011/01/2013', value: 12}
        {date:'011/02/2013', value: 13}
        {date:'011/03/2013', value: 14}
        {date:'011/04/2013', value: 15}
      ]
      after.history = {exp: _.cloneDeep(history), todos: _.cloneDeep(history)}
      after.habits[0].history = _.cloneDeep(history)
      after.fns.cron()

      # remove history entries created by cron
      after.history.exp.pop()
      after.history.todos.pop()

      _.each [after.history.exp, after.history.todos, after.habits[0].history], (arr) ->
        expect(_.map(arr, (x)->x.value)).to.eql [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

  describe 'Todos', ->
    it '1 day missed', ->
      {before,after} = beforeAfter({daysAgo:1})
      before.dailys = after.dailys = []
      after.fns.cron()

      # todos don't effect stats
      expect(after).toHaveHP 50
      expect(after).toHaveExp 0
      expect(after).toHaveGP 0

      # but they devalue
      expect(after.todos[0].value).to.be.lessThan before.todos[0].value
      expect(after.history.todos).to.have.length 1

  describe 'dailies', ->

    describe 'new day', ->

      ###
      This section runs through a "cron matrix" of all permutations (that I can easily account for). It sets
      task due days, user custom day start, timezoneOffset, etc - then runs cron, jumps to tomorrow and runs cron,
      and so on - testing each possible outcome along the way
      ###

      runCron = (options) ->
        _.each [480, 240, 0, -120], (timezoneOffset) -> # test different timezones
          now = shared.startOfWeek({timezoneOffset}).add('hours', options.currentHour||0)
          {before,after} = beforeAfter({now, timezoneOffset, daysAgo:1, dayStart:options.dayStart||0, limitOne:'daily'})
          before.dailys[0].repeat = after.dailys[0].repeat = options.repeat if options.repeat
          before.dailys[0].streak = after.dailys[0].streak = 10
          before.dailys[0].completed = after.dailys[0].completed = true if options.checked
          if options.shouldDo
            expect(shared.shouldDo(now, options.repeat, {timezoneOffset, dayStart:options.dayStart, now})).to.be.ok()
          after.fns.cron {now}
          switch options.expect
            when 'losePoints' then expectLostPoints(before,after,'daily')
            when 'noChange' then expectNoChange(before,after)
            when 'noDamage' then expectDayResetNoDamage(before,after)
          {before,after}

      cronMatrix =
        steps:

          'due yesterday':
            defaults: {daysAgo:1, limitOne: 'daily'}
            steps:

              '(simple)': {expect:'losePoints'}

              'due today':
                # NOTE: a strange thing here, moment().startOf('week') is Sunday, but moment.zone(myTimeZone).startOf('week') is Monday.
                defaults: {repeat:{su:1,m:true,t:1,w:1,th:1,f:1,s:1}}
                steps:
                  'pre-dayStart':
                    defaults: {currentHour:3, dayStart:4, shouldDo:true}
                    steps:
                      'checked': {checked: true, expect:'noChange'}
                      'un-checked': {checked: false, expect:'noChange'}
                  'post-dayStart':
                    defaults: {currentHour:5, dayStart:4, shouldDo:true}
                    steps:
                      'checked': {checked:true, expect:'noDamage'}
                      'unchecked': {checked:false, expect: 'losePoints'}

              'NOT due today':
                defaults: {repeat:{su:1,m:false,t:1,w:1,th:1,f:1,s:1}}
                steps:
                  'pre-dayStart':
                    defaults: {currentHour:3, dayStart:4, shouldDo:true}
                    steps:
                      'checked': {checked: true, expect:'noChange'}
                      'un-checked': {checked: false, expect:'noChange'}
                  'post-dayStart':
                    defaults: {currentHour:5, dayStart:4, shouldDo:false}
                    steps:
                      'checked': {checked:true, expect:'noDamage'}
                      'unchecked': {checked:false, expect: 'losePoints'}

          'not due yesterday':
            defaults: repeatWithoutLastWeekday()
            steps:
              '(simple)': {expect:'noDamage'}
              'post-dayStart': {currentHour:5,dayStart:4, expect:'noDamage'}
              'pre-dayStart': {currentHour:3, dayStart:4, expect:'noChange'}

      recurseCronMatrix = (obj, options={}) ->
        if obj.steps
          _.each obj.steps, (step, text) ->
            o = _.cloneDeep options
            o.text ?= ''; o.text += " #{text} "
            recurseCronMatrix step, _.defaults(o,obj.defaults)
        else
          it "#{options.text}", -> runCron(_.defaults(obj,options))
      recurseCronMatrix(cronMatrix)

    it 'calculates day differences with dayStart properly', ->
      dayStart = 4
      yesterday = shared.startOfDay {now: moment().subtract('d', 1), dayStart}
      now = shared.startOfDay {dayStart: dayStart-1}
      expect(shared.daysSince(yesterday, {now, dayStart})).to.eql 0
      now = moment().startOf('day').add('h', dayStart).add('m', 1)
      expect(shared.daysSince(yesterday, {now, dayStart})).to.eql 1

describe 'Helper', ->
  it 'calculates gold coins', ->
    expect(shared.gold(10)).to.eql 10
    expect(shared.gold(1.957)).to.eql 1
    expect(shared.gold()).to.eql 0

  it 'calculates silver coins', ->
    expect(shared.silver(10)).to.eql 0
    expect(shared.silver(1.957)).to.eql 95
    expect(shared.silver(0.01)).to.eql "01"
    expect(shared.silver()).to.eql "00"

  it 'calculates experience to next level', ->
    expect(shared.tnl 1).to.eql 150
    expect(shared.tnl 2).to.eql 160
    expect(shared.tnl 10).to.eql 260
    expect(shared.tnl 99).to.eql 3580
    expect(shared.tnl 100).to.eql 0

  it 'calculates the start of the day', ->
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 0)}).format('YYYY-MM-DD HH:mm')).to.eql '2013-01-01 00:00'
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 5)}).format('YYYY-MM-DD HH:mm')).to.eql '2013-01-01 00:00'
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 23, 59, 59)}).format('YYYY-MM-DD HH:mm')).to.eql '2013-01-01 00:00'

  it 'counts pets', ->
    pets = {}
    expect(shared.countPets(null, pets)).to.eql 0
    expect(shared.countPets(1, pets)).to.eql 1

    pets = { "Dragon-Red": 1, "Wolf-Base": 2 }
    expect(shared.countPets(null, pets)).to.eql 2
    expect(shared.countPets(2, pets)).to.eql 2

    pets = { "Dragon-Red": 1, "Gryphon-Base": 1 }
    expect(shared.countPets(null, pets)).to.eql 1
    expect(shared.countPets(_.size(pets), pets)).to.eql 1

    pets = { "Wolf-Base": 2, "Wolf-Veteran": 1, "Wolf-Cerberus": 1, "Dragon-Hydra": 1}
    expect(shared.countPets(null, pets)).to.eql 1
    expect(shared.countPets(_.size(pets), pets)).to.eql 1

  it 'counts mounts', ->
    mounts = {}
    expect(shared.countMounts(null, mounts)).to.eql 0
    expect(shared.countMounts(1, mounts)).to.eql 1

    mounts = { "Dragon-Red": 1, "Wolf-Base": 2 }
    expect(shared.countMounts(null, mounts)).to.eql 2
    expect(shared.countMounts(2, mounts)).to.eql 2

    mounts = { "Dragon-Red": 1, "Gryphon-Base": 1 }
    expect(shared.countMounts(null, mounts)).to.eql 2
    expect(shared.countMounts(_.size(mounts), mounts)).to.eql 2

    mounts = { "Wolf-Base": 2, "BearCub-Polar": 1}
    expect(shared.countMounts(null, mounts)).to.eql 1
    expect(shared.countMounts(_.size(mounts), mounts)).to.eql 1
