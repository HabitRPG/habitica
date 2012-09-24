{expect} = require 'derby/node_modules/racer/test/util'
{BrowserModel: Model} = require 'derby/node_modules/racer/test/util/model'
derby = require 'derby'

# Custom modules
scoring = require '../src/app/scoring'
schema = require '../src/app/schema'
_ = require '../public/js/underscore-min'

describe 'Scoring', ->
  model = null
  
  beforeEach ->
    model = new Model
    model.set '_user', schema.newUserObject()
    scoring.setModel model

  it 'should set user defaults correctly', ->
    user = model.get '_user'
    expect(user.stats).to.eql { money: 0, exp: 0, lvl: 1, hp: 50 }
    expect(user.items).to.eql { itemsEnabled: false, armor: 0, weapon: 0, rerollsRemaining: 5 }
    expect(user.balance).to.eql 2
    expect(_.size(user.tasks)).to.eql 9
    expect(_.size(user.habitIds)).to.eql 3
    expect(_.size(user.dailyIds)).to.eql 3
    expect(_.size(user.todoIds)).to.eql 1
    expect(_.size(user.completedIds)).to.eql 0
    expect(_.size(user.rewardIds)).to.eql 2
  
  ##### Habits #####  
  describe 'Habits', ->
    uuid = null
    taskPath = null
    
    beforeEach ->
      # create a test task
      user = model.get('_user')
      uuid = derby.uuid()
      taskPath = "_user.tasks.#{uuid}"
      model.refList "_habitList", "_user.tasks", "_user.habitIds"
      model.at('_habitList').push {type: 'habit', text: 'Habit', value: 0, up: true, down: true, id: uuid}
    
    it 'should have created the habit', ->
      task = model.get(taskPath)
      expect(task.text).to.eql 'Habit'
      expect(task.value).to.eql 0
      
    it 'should make proper modifications when down-scored', ->
      # Down-score the habit
      [userBefore, taskBefore] = [model.get('_user'), model.get(taskPath)]
      scoring.score(uuid, 'down')
      [userAfter, taskAfter] = [model.get('_user'), model.get(taskPath)]
      
      # User should have lost HP 
      expect(userAfter.stats.hp).to.be.lessThan userBefore.stats.hp
      # Exp, GP should stay the same
      expect(userAfter.stats.money).to.eql userBefore.stats.money
      expect(userAfter.stats.exp).to.eql userBefore.stats.exp
      # Task should have gained in value
      expect(taskAfter.value).to.be.greaterThan taskBefore.value
      
    it 'should make proper modifications when up-scored', ->
      # Up-score the habit
      [userBefore, taskBefore] = [model.get('_user'), model.get(taskPath)]
      scoring.score(uuid, 'up')
      [userAfter, taskAfter] = [model.get('_user'), model.get(taskPath)]
      
      # User should have gained Exp, GP 
      expect(userAfter.stats.exp).to.be.greaterThan userBefore.stats.exp
      expect(userAfter.stats.money).to.be.greaterThan userBefore.stats.money
      # HP should not change
      expect(userAfter.stats.hp).to.eql userBefore.stats.hp
      # Task should have lost value
      expect(taskAfter.value).to.be.lessThan taskBefore.value
      
   
    it 'should not modify certain attributes given certain conditions'
      # non up+down habits
      # what else?
      
          
  it 'should modify damage based on lvl & armor'     
  it 'should always decrease hp with damage, regardless of stats/items'
  it 'should always increase exp/gp with gain, regardless of stats/items'
  it 'should calculate cron based on difference between start-of-days, and not run in the middle of the day'
  it 'should show "undo" notification if user unchecks completed daily'
