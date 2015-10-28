_ = require 'lodash'
expect = require 'expect.js'
sinon = require 'sinon'
moment = require 'moment'
shared = require '../../common/script/index.coffee'
shared.i18n.translations = require('../../website/src/i18n.js').translations
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
        owned: {}
      quests: {}
    party:
      quest:
        progress:
          down: 0
    preferences: {}
    habits: []
    dailys: []
    todos: []
    rewards: []
    flags: {}
    achievements:
      ultimateGearSets: {}
    contributor:
      level: 2
    _tmp: {}

  shared.wrap(user)
  user.ops.reset(null, ->)
  if addTasks
    _.each ['habit', 'todo', 'daily'], (task)->
      user.ops.addTask {body: {type: task, id: shared.uuid()}}
  user

getTasksForUser = (user) ->
  return user.habits.concat(user.dailys)
          .concat(user.todos).concat(user.rewards)

rewrapUser = (user)->
  user._wrapped = false
  shared.wrap(user)
  user

expectStrings = (obj, paths) ->
  _.each paths, (path) -> expect(obj[path]).to.be.ok()

# options.daysAgo: days ago when the last cron was executed
# cronAfterStart: moves the lastCron to be after the dayStart.
#  This way the daysAgo works as expected if the test case
#  makes the assumption that the lastCron was after dayStart.
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
  lastCron = moment(options.now || +new Date).subtract( {days:options.daysAgo} ) if options.daysAgo
  lastCron.add( {hours:options.dayStart, minutes:1} ) if options.daysAgo and options.cronAfterStart
  lastCron = +lastCron if options.daysAgo
  _.each [before,after], (obj) ->
    obj.lastCron = lastCron if options.daysAgo
  {before:before, after:after}
#TODO calculate actual points

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
  _.each $w('stats items gear dailys todos rewards preferences'), (attr)->
    expect(after[attr]).to.eql before[attr]

expectClosePoints = (before, after, taskType) ->
  expect( Math.abs(after.stats.exp - before.stats.exp) ).to.be.lessThan 0.0001
  expect( Math.abs(after.stats.gp - before.stats.gp) ).to.be.lessThan 0.0001
  expect( Math.abs(after["#{taskType}s"][0].value - before["#{taskType}s"][0].value) ).to.be.lessThan 0.0001

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
  repeat = {su:true,m:true,t:true,w:true,th:true,f:true,s:true}
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
    _.times 3, ->user.dailys.push shared.taskDefaults({type:'daily', startDate: moment().subtract(7, 'days')})
    cron = -> 
      user.lastCron = moment().subtract(1,'days')
      daysMissed = user.fns.shouldCronRun()
      if daysMissed > 0 
        user.fns.cron({tasks: getTasksForUser(user), daysMissed: daysMissed})

    cron()
    expect(user.stats.buffs.str).to.be 0
    expect(user.achievements.perfect).to.not.be.ok()

    user.dailys[0].completed = true
    cron()
    expect(user.stats.buffs.str).to.be 0
    expect(user.achievements.perfect).to.not.be.ok()

    _.each user.dailys, (d)->d.completed = true
    cron()
    expect(user.stats.buffs.str).to.be 1
    expect(user.achievements.perfect).to.be 1

    # Handle greyed-out dailys
    yesterday = moment().subtract(1,'days')
    user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false
    _.each user.dailys[1..], (d)->d.completed = true
    cron()
    expect(user.stats.buffs.str).to.be 1
    expect(user.achievements.perfect).to.be 2

  describe 'Resting in the Inn', ->
    user = null
    cron = null

    beforeEach ->
      user = newUser()
      user.preferences.sleep = true
      cron = -> 
        user.lastCron = moment().subtract(1,'days')
        daysMissed = user.fns.shouldCronRun()
        if daysMissed > 0 
          user.fns.cron({tasks: getTasksForUser(user), daysMissed: daysMissed})
      user.dailys = []
      _.times 2, -> user.dailys.push shared.taskDefaults({type:'daily', startDate: moment().subtract(7, 'days')})

    it 'remains in the inn on cron', ->
      cron()
      expect(user.preferences.sleep).to.be true

    it 'resets dailies', ->
       user.dailys[0].completed = true
       cron()
       expect(user.dailys[0].completed).to.be false

    it 'resets checklist on incomplete dailies', ->
       user.dailys[0].checklist = [
         {
           "text" : "1",
           "id" : "checklist-one",
           "completed" : true
         },
         {
           "text" : "2",
           "id" : "checklist-two",
           "completed" : true
         },
         {
           "text" : "3",
           "id" : "checklist-three",
           "completed" : false
         }
       ]
       cron()
       _.each user.dailys[0].checklist, (box)->
         expect(box.completed).to.be false

    it 'resets checklist on complete dailies', ->
       user.dailys[0].checklist = [
         {
           "text" : "1",
           "id" : "checklist-one",
           "completed" : true
         },
         {
           "text" : "2",
           "id" : "checklist-two",
           "completed" : true
         },
         {
           "text" : "3",
           "id" : "checklist-three",
           "completed" : false
         }
       ]
       user.dailys[0].completed = true
       cron()
       _.each user.dailys[0].checklist, (box)->
         expect(box.completed).to.be false

    it 'does not reset checklist on grey incomplete dailies', ->
      yesterday = moment().subtract(1,'days')
      user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false
      user.dailys[0].checklist = [
        {
          "text" : "1",
          "id" : "checklist-one",
          "completed" : true
        },
        {
          "text" : "2",
          "id" : "checklist-two",
          "completed" : true
        },
        {
          "text" : "3",
          "id" : "checklist-three",
          "completed" : true
        }
      ]

      cron()
      _.each user.dailys[0].checklist, (box)->
        expect(box.completed).to.be true

    it 'resets checklist on complete grey complete dailies', ->
      yesterday = moment().subtract(1,'days')
      user.dailys[0].repeat[shared.dayMapping[yesterday.day()]] = false
      user.dailys[0].checklist = [
        {
          "text" : "1",
          "id" : "checklist-one",
          "completed" : true
        },
        {
          "text" : "2",
          "id" : "checklist-two",
          "completed" : true
        },
        {
          "text" : "3",
          "id" : "checklist-three",
          "completed" : true
        }
      ]
      user.dailys[0].completed = true

      cron()
      _.each user.dailys[0].checklist, (box)->
        expect(box.completed).to.be false

    it 'does not damage user for incomplete dailies', ->
      expect(user).toHaveHP 50
      user.dailys[0].completed = true
      user.dailys[1].completed = false
      cron()
      expect(user).toHaveHP 50

    it 'gives credit for complete dailies', ->
      user.dailys[0].completed = true
      expect(user.dailys[0].history).to.be.empty
      cron()
      expect(user.dailys[0].history).to.not.be.empty

    it 'damages user for incomplete dailies after checkout', ->
      expect(user).toHaveHP 50
      user.dailys[0].completed = true
      user.dailys[1].completed = false
      user.preferences.sleep = false
      cron()
      expect(user.stats.hp).to.be.lessThan 50

  describe 'Death', ->
    user = undefined
    it 'revives correctly', ->
      user = newUser()
      user.stats = { gp: 10, exp: 100, lvl: 2, hp: 0, class: 'warrior' }
      user.ops.revive()
      expect(user).toHaveGP 0
      expect(user).toHaveExp 0
      expect(user).toHaveLevel 1
      expect(user).toHaveHP 50
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: false }

    it "doesn't break unbreakables", ->
      ce = shared.countExists
      user = newUser()
      # breakables (includes default weapon_warrior_0):
      user.items.gear.owned['shield_warrior_1'] = true
      # unbreakables because off-class or 0 value:
      user.items.gear.owned['shield_rogue_1'] = true
      user.items.gear.owned['head_special_nye'] = true
      expect(ce user.items.gear.owned).to.be 4
      user.stats.hp = 0
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 3
      user.stats.hp = 0
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 2
      user.stats.hp = 0
      user.ops.revive()
      expect(ce(user.items.gear.owned)).to.be 2
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: false, shield_warrior_1: false, shield_rogue_1: true, head_special_nye: true }

    it "handles event items", ->
      shared.content.gear.flat.head_special_nye.event.start = '2012-01-01'
      shared.content.gear.flat.head_special_nye.event.end = '2012-02-01'
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be true
      delete user.items.gear.owned['head_special_nye']
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be false

      shared.content.gear.flat.head_special_nye.event.start = moment().subtract(5,'days')
      shared.content.gear.flat.head_special_nye.event.end = moment().add(5,'days')
      expect(shared.content.gear.flat.head_special_nye.canOwn(user)).to.be true

  describe 'Rebirth', ->
    user = undefined
    it 'removes correct gear', ->
      user = newUser()
      user.stats.lvl = 100
      user.items.gear.owned = {
        "weapon_warrior_0": true,
        "weapon_warrior_1": true,
        "armor_warrior_1": false,
        "armor_mystery_201402": true,
        "back_mystery_201402": false,
        "head_mystery_201402": true,
        "weapon_armoire_basicCrossbow": true,
        }
      user.ops.rebirth()
      expect(user.items.gear.owned).to.eql {
        "weapon_warrior_0": true,
        "weapon_warrior_1": false,
        "armor_warrior_1": false,
        "armor_mystery_201402": true,
        "back_mystery_201402": false,
        "head_mystery_201402": true,
        "weapon_armoire_basicCrossbow": false,
        }

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

    it 'does not buy equipment without enough Gold', ->
      user = newUser()
      user.stats.gp = 1
      user.ops.buy {params: {key: 'armor_warrior_1'}}
      expect(user.items.gear.equipped).to.eql { armor: 'armor_base_0', weapon: 'weapon_base_0', head: 'head_base_0', shield: 'shield_base_0' }
      expect(user).toHaveGP 1

    it 'buys a Quest scroll', ->
      user = newUser()
      user.stats.gp = 205
      user.ops.buyQuest {params: {key: 'dilatoryDistress1'}}
      expect(user.items.quests).to.eql {dilatoryDistress1: 1}
      expect(user).toHaveGP 5

    it 'does not buy Quests without enough Gold', ->
      user = newUser()
      user.stats.gp = 1
      user.ops.buyQuest {params: {key: 'dilatoryDistress1'}}
      expect(user.items.quests).to.eql {}
      expect(user).toHaveGP 1

    it 'does not buy nonexistent Quests', ->
      user = newUser()
      user.stats.gp = 9999
      user.ops.buyQuest {params: {key: 'snarfblatter'}}
      expect(user.items.quests).to.eql {}
      expect(user).toHaveGP 9999

    it 'does not buy Gem-premium Quests', ->
      user = newUser()
      user.stats.gp = 9999
      user.ops.buyQuest {params: {key: 'kraken'}}
      expect(user.items.quests).to.eql {}
      expect(user).toHaveGP 9999

  describe 'Gem purchases', ->
    it 'does not purchase items without enough Gems', ->
      user = newUser()
      user.ops.purchase {params: {type: 'eggs', key: 'Cactus'}}
      user.ops.purchase {params: {type: 'gear', key: 'headAccessory_special_foxEars'}}
      user.ops.unlock {query: {path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars'}}
      expect(user.items.eggs).to.eql {}
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: true }

    it 'purchases an egg', ->
      user = newUser()
      user.balance = 1
      user.ops.purchase {params: {type: 'eggs', key: 'Cactus'}}
      expect(user.items.eggs).to.eql { Cactus: 1}
      expect(user.balance).to.eql 0.25

    it 'purchases fox ears', ->
      user = newUser()
      user.balance = 1
      user.ops.purchase {params: {type: 'gear', key: 'headAccessory_special_foxEars'}}
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: true, headAccessory_special_foxEars: true }
      expect(user.balance).to.eql 0.5

    it 'unlocks all the animal ears at once', ->
      user = newUser()
      user.balance = 2
      user.ops.unlock {query: {path: 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars'}}
      expect(user.items.gear.owned).to.eql { weapon_warrior_0: true, headAccessory_special_bearEars: true, headAccessory_special_cactusEars: true, headAccessory_special_foxEars: true, headAccessory_special_lionEars: true, headAccessory_special_pandaEars: true, headAccessory_special_pigEars: true, headAccessory_special_tigerEars: true, headAccessory_special_wolfEars: true}
      expect(user.balance).to.eql 0.75

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
    MIN_RANGE_FOR_POTION = 0
    MAX_RANGE_FOR_POTION = .3
    MIN_RANGE_FOR_EGG = .4
    MAX_RANGE_FOR_EGG = .6
    MIN_RANGE_FOR_FOOD = .7
    MAX_RANGE_FOR_FOOD = 1

    beforeEach ->
      user = newUser()
      user.flags.dropsEnabled = true
      @task_id = shared.uuid()
      user.ops.addTask({body: {type: 'daily', id: @task_id}})

    it 'drops a hatching potion', ->
      for random in [MIN_RANGE_FOR_POTION..MAX_RANGE_FOR_POTION] by .1
        sinon.stub(user.fns, 'predictableRandom').returns random
        user.ops.score {params: { id: @task_id, direction: 'up'}}
        expect(user.items.eggs).to.be.empty
        expect(user.items.hatchingPotions).to.not.be.empty
        expect(user.items.food).to.be.empty
        user.fns.predictableRandom.restore()

    it 'drops a pet egg', ->
      for random in [MIN_RANGE_FOR_EGG..MAX_RANGE_FOR_EGG] by .1
        sinon.stub(user.fns, 'predictableRandom').returns random
        user.ops.score {params: { id: @task_id, direction: 'up'}}
        expect(user.items.eggs).to.not.be.empty
        expect(user.items.hatchingPotions).to.be.empty
        expect(user.items.food).to.be.empty
        user.fns.predictableRandom.restore()

    it 'drops food', ->
      for random in [MIN_RANGE_FOR_FOOD..MAX_RANGE_FOR_FOOD] by .1
        sinon.stub(user.fns, 'predictableRandom').returns random
        user.ops.score {params: { id: @task_id, direction: 'up'}}
        expect(user.items.eggs).to.be.empty
        expect(user.items.hatchingPotions).to.be.empty
        expect(user.items.food).to.not.be.empty
        user.fns.predictableRandom.restore()

    it 'does not get a drop', ->
      sinon.stub(user.fns, 'predictableRandom').returns 0.5
      user.ops.score {params: { id: @task_id, direction: 'up'}}
      expect(user.items.eggs).to.eql {}
      expect(user.items.hatchingPotions).to.eql {}
      expect(user.items.food).to.eql {}
      user.fns.predictableRandom.restore()

  describe 'Quests', ->
    _.each shared.content.quests, (quest)->
      it "#{quest.text()} has valid values", ->
        expect(quest.notes()).to.be.an('string')
        expect(quest.completion()).to.be.an('string') if quest.completion
        expect(quest.previous).to.be.an('string') if quest.previous
        expect(quest.value).to.be.greaterThan 0 if quest.canBuy()
        expect(quest.drop.gp).to.not.be.lessThan 0
        expect(quest.drop.exp).to.not.be.lessThan 0
        expect(quest.category).to.match(/pet|unlockable|gold|world/)
        if quest.drop.items
          expect(quest.drop.items).to.be.an(Array)
        if quest.boss
          expect(quest.boss.name()).to.be.an('string')
          expect(quest.boss.hp).to.be.greaterThan 0
          expect(quest.boss.str).to.be.greaterThan 0
        else if quest.collect
          _.each quest.collect, (collect)->
            expect(collect.text()).to.be.an('string')
            expect(collect.count).to.be.greaterThan 0

  describe 'Achievements', ->
    _.each shared.content.classes, (klass) ->
      user = newUser()
      user.stats.gp = 10000
      _.each shared.content.gearTypes, (type) ->
        _.each [1..5], (i) ->
          user.ops.buy {params:'#{type}_#{klass}_#{i}'}
      it 'does not get ultimateGear ' + klass, ->
        expect(user.achievements.ultimateGearSets[klass]).to.not.be.ok()
      _.each shared.content.gearTypes, (type) ->
        user.ops.buy {params:'#{type}_#{klass}_6'}
      xit 'gets ultimateGear ' + klass, ->
        expect(user.achievements.ultimateGearSets[klass]).to.be.ok()

    it 'does not remove existing Ultimate Gear achievements', ->
      user = newUser()
      user.achievements.ultimateGearSets = {'healer':true,'wizard':true,'rogue':true,'warrior':true}
      user.items.gear.owned.shield_warrior_5 = false
      user.items.gear.owned.weapon_rogue_6 = false
      user.ops.buy {params:'shield_warrior_5'}
      expect(user.achievements.ultimateGearSets).to.eql {'healer':true,'wizard':true,'rogue':true,'warrior':true}

  describe 'unlocking features', ->
    it 'unlocks drops at level 3', ->
      user = newUser()
      user.stats.lvl = 3
      user.fns.updateStats(user.stats)
      expect(user.flags.dropsEnabled).to.be.ok()

    it 'unlocks Rebirth at level 50', ->
      user = newUser()
      user.stats.lvl = 50
      user.fns.updateStats(user.stats)
      expect(user.flags.rebirthEnabled).to.be.ok()

    describe 'level-awarded Quests', ->
      it 'gets Attack of the Mundane at level 15', ->
        user = newUser()
        user.stats.lvl = 15
        user.fns.updateStats(user.stats)
        expect(user.flags.levelDrops.atom1).to.be.ok()    
        expect(user.items.quests.atom1).to.eql 1

      it 'gets Vice at level 30', ->
        user = newUser()
        user.stats.lvl = 30
        user.fns.updateStats(user.stats)
        expect(user.flags.levelDrops.vice1).to.be.ok()
        expect(user.items.quests.vice1).to.eql 1

      it 'gets Golden Knight at level 40', ->
        user = newUser()
        user.stats.lvl = 40
        user.fns.updateStats(user.stats)
        expect(user.flags.levelDrops.goldenknight1).to.be.ok()
        expect(user.items.quests.goldenknight1).to.eql 1

      it 'gets Moonstone Chain at level 60', ->
        user = newUser()
        user.stats.lvl = 60
        user.fns.updateStats(user.stats)
        expect(user.flags.levelDrops.moonstone1).to.be.ok()
        expect(user.items.quests.moonstone1).to.eql 1

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

  it 'Dailys : Up, Down', ->
    @after.ops.score {params: {id: @after.dailys[0].id, direction: 'up'}}
    @after.ops.score {params: {id: @after.dailys[0].id, direction: 'down'}}
    expectClosePoints(@before, @after, 'daily')

  it 'Todos : Up', ->
    @after.ops.score {params: {id: @after.todos[0].id, direction: 'up'}}
    expectGainedPoints(@before, @after,'todo')

  it 'Todos : Up, Down', ->
    @after.ops.score {params: {id: @after.todos[0].id, direction: 'up'}}
    @after.ops.score {params: {id: @after.todos[0].id, direction: 'down'}}
    expectClosePoints(@before, @after, 'todo')

describe 'Cron', ->

  it 'computes shouldCron', ->
    user = newUser()

    daysMissed = user.fns.shouldCronRun()
    paths = {
      daysMissed: daysMissed,
      tasks: getTasksForUser(user)
    }
    user.fns.cron paths if daysMissed > 0
    expect(user.lastCron).to.not.be.ok # it setup the cron property now

    user.lastCron = +moment().subtract(1,'days')

    daysMissed = user.fns.shouldCronRun()
    paths = {
      daysMissed: daysMissed,
      tasks: getTasksForUser(user)
    }
    user.fns.cron paths if daysMissed > 0
    expect(user.lastCron).to.be.greaterThan 0

#    user.lastCron = +moment().add(1,'days')
#    paths = {};algos.cron user, {paths}
#    expect(paths.lastCron).to.be true # busted cron (was set to after today's date)

  it 'only dailies & todos are affected', ->
    {before,after} = beforeAfter({daysAgo:1})
    before.dailys = before.todos = after.dailys = after.todos = []
    daysMissed = after.fns.shouldCronRun()
    paths = {
      daysMissed: daysMissed,
      tasks: getTasksForUser(after)
    }
    after.fns.cron(paths) if daysMissed > 0
    before.stats.mp=after.stats.mp #FIXME
    expect(after.lastCron).to.not.be before.lastCron # make sure cron was run
    delete after.stats.buffs;delete before.stats.buffs
    expect(before.stats).to.eql after.stats
    beforeTasks = before.habits.concat(before.dailys).concat(before.todos).concat(before.rewards)
    afterTasks = after.habits.concat(after.dailys).concat(after.todos).concat(after.rewards)
    expect(beforeTasks).to.eql afterTasks

  describe 'preening', ->
    beforeEach ->
      @clock = sinon.useFakeTimers(Date.parse("2013-11-20"), "Date")

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
      daysMissed = after.fns.shouldCronRun()
      paths = {
        daysMissed: daysMissed,
        tasks: getTasksForUser(after)
      }
      after.fns.cron(paths) if daysMissed > 0

      # remove history entries created by cron
      after.history.exp.pop()
      after.history.todos.pop()

      _.each [after.history.exp, after.history.todos, after.habits[0].history], (arr) ->
        expect(_.map(arr, (x)->x.value)).to.eql [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

  describe 'Todos', ->
    it '1 day missed', ->
      {before,after} = beforeAfter({daysAgo:1})
      before.dailys = after.dailys = []
      daysMissed = after.fns.shouldCronRun()
      paths = {
        daysMissed: daysMissed,
        tasks: getTasksForUser(after)
      }
      after.fns.cron(paths) if daysMissed > 0

      # todos don't effect stats
      expect(after).toHaveHP 50
      expect(after).toHaveExp 0
      expect(after).toHaveGP 0

      # but they devalue
      expect(before.todos[0].value).to.be 0  # sanity check for task setup
      expect(after.todos[0].value).to.be -1  # the actual test
      expect(after.history.todos).to.have.length 1

    it '2 days missed', ->
      {before,after} = beforeAfter({daysAgo:2})
      before.dailys = after.dailys = []
      daysMissed = after.fns.shouldCronRun()
      paths = {
        daysMissed: daysMissed,
        tasks: getTasksForUser(after)
      }
      after.fns.cron(paths) if daysMissed > 0

      # todos devalue by only one day's worth of devaluation
      expect(before.todos[0].value).to.be 0  # sanity check for task setup
      expect(after.todos[0].value).to.be -1  # the actual test

  # I used hard-coded dates here instead of 'now' so the tests don't fail
  #  when you run them between midnight and dayStart. Nothing worse than
  #  intermittent failures.
  describe 'cron day calculations', ->
    dayStart = 4
    fstr = "YYYY-MM-DD HH:mm:ss"

    it 'startOfDay before dayStart', ->
      # If the time is before dayStart, then we expect the start of the day to be yesterday at dayStart
      start = shared.startOfDay {now: moment('2014-10-09 02:30:00'), dayStart}
      expect(start.format(fstr)).to.eql '2014-10-08 04:00:00'

    it 'startOfDay after dayStart', ->
      # If the time is after dayStart, then we expect the start of the day to be today at dayStart
      start = shared.startOfDay {now: moment('2014-10-09 05:30:00'), dayStart}
      expect(start.format(fstr)).to.eql '2014-10-09 04:00:00'

    it 'daysSince cron before, now after', ->
      # If the lastCron was before dayStart, then a time on the same day after dayStart
      #  should be 1 day later than lastCron
      lastCron = moment('2014-10-09 02:30:00')
      days = shared.daysSince(lastCron, {now: moment('2014-10-09 11:30:00'), dayStart})
      expect(days).to.eql 1

    it 'daysSince cron before, now before', ->
      # If the lastCron was before dayStart, then a time on the same day also before dayStart
      #  should be 0 days later than lastCron
      lastCron = moment('2014-10-09 02:30:00')
      days = shared.daysSince(lastCron, {now: moment('2014-10-09 03:30:00'), dayStart})
      expect(days).to.eql 0

    it 'daysSince cron after, now after', ->
      # If the lastCron was after dayStart, then a time on the same day also after dayStart
      #  should be 0 days later than lastCron
      lastCron = moment('2014-10-09 05:30:00')
      days = shared.daysSince(lastCron, {now: moment('2014-10-09 06:30:00'), dayStart})
      expect(days).to.eql 0

    it 'daysSince cron after, now tomorrow before', ->
      # If the lastCron was after dayStart, then a time on the following day but before dayStart
      #  should be 0 days later than lastCron
      lastCron = moment('2014-10-09 12:30:00')
      days = shared.daysSince(lastCron, {now: moment('2014-10-10 01:30:00'), dayStart})
      expect(days).to.eql 0

    it 'daysSince cron after, now tomorrow after', ->
      # If the lastCron was after dayStart, then a time on the following day and after dayStart
      #  should be 1 day later than lastCron
      lastCron = moment('2014-10-09 12:30:00')
      days = shared.daysSince(lastCron, {now: moment('2014-10-10 10:30:00'), dayStart})
      expect(days).to.eql 1

    xit 'daysSince, last cron before new dayStart', ->
      # If lastCron was after dayStart (at 1am) with dayStart set at 0, changing dayStart to 4am
      #  should not trigger another cron the same day

      # dayStart is 0
      lastCron = moment('2014-10-09 01:00:00')
      # dayStart is 4
      days = shared.daysSince(lastCron, {now: moment('2014-10-09 05:00:00'), dayStart})
      expect(days).to.eql 0

  describe 'dailies', ->

    describe 'new day', ->

      ###
      This section runs through a "cron matrix" of all permutations (that I can easily account for). It sets
      task due days, user custom day start, timezoneOffset, etc - then runs cron, jumps to tomorrow and runs cron,
      and so on - testing each possible outcome along the way
      ###

      runCron = (options) ->
        _.each [480, 240, 0, -120], (timezoneOffset) -> # test different timezones
          now = shared.startOfWeek({timezoneOffset}).add(options.currentHour||0, 'hours')
          {before,after} = beforeAfter({now, timezoneOffset, daysAgo:1, cronAfterStart:options.cronAfterStart||true, dayStart:options.dayStart||0, limitOne:'daily'})
          before.dailys[0].repeat = after.dailys[0].repeat = options.repeat if options.repeat
          before.dailys[0].streak = after.dailys[0].streak = 10
          before.dailys[0].completed = after.dailys[0].completed = true if options.checked
          before.dailys[0].startDate = after.dailys[0].startDate = moment().subtract(30, 'days')
          if options.shouldDo
            expect(shared.shouldDo(now.toDate(), after.dailys[0], {timezoneOffset, dayStart:options.dayStart, now})).to.be.ok()
          daysMissed = after.fns.shouldCronRun({now})
          tasks = getTasksForUser(after);
          if daysMissed > 0 then after.fns.cron({now, daysMissed, tasks})
          before.stats.mp=after.stats.mp #FIXME
          switch options.expect
            when 'losePoints' then expectLostPoints(before,after,'daily')
            when 'noChange' then expectNoChange(before,after)
            when 'noDamage' then expectDayResetNoDamage(before,after)
          {before,after}

      # These test cases were written assuming that lastCron was run after dayStart
      #  even if currentHour < dayStart and lastCron = yesterday at currentHour.
      #  cronAfterStart makes sure that lastCron is moved to be after dayStart.
      cronMatrix =
        steps:

          'due yesterday':
            defaults: {daysAgo:1, cronAfterStart:true, limitOne: 'daily'}
            steps:

              '(simple)': {expect:'losePoints'}

              'due today':
                # NOTE: a strange thing here, moment().startOf('week') is Sunday, but moment.zone(myTimeZone).startOf('week') is Monday.
                defaults: {repeat:{su:true,m:true,t:true,w:true,th:true,f:true,s:true}}
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
                defaults: {repeat:{su:true,m:false,t:true,w:true,th:true,f:true,s:true}}
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

  it 'calculates the start of the day', ->
    fstr = 'YYYY-MM-DD HH:mm:ss'
    today = '2013-01-01 00:00:00'
    # get the timezone for the day, so the test case doesn't fail
    #  if you run it during daylight savings time because by default
    #  it uses moment().zone() which is the current minute offset
    zone = moment(today).zone()
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 0)}, timezoneOffset:zone).format(fstr)).to.eql today
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 5)}, timezoneOffset:zone).format(fstr)).to.eql today
    expect(shared.startOfDay({now: new Date(2013, 0, 1, 23, 59, 59), timezoneOffset:zone}).format(fstr)).to.eql today
