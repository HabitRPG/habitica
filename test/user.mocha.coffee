{expect} = require 'derby/node_modules/racer/test/util'
{BrowserModel: Model} = require 'derby/node_modules/racer/test/util/model'
derby = require 'derby'
_ = require 'lodash'
moment = require 'moment'

# Custom modules
scoring = require '../src/app/scoring'
schema = require '../src/app/schema'
  
###### Specs ######

describe 'User', ->
  model = null

  beforeEach ->
    model = new Model
    model.set '_user', schema.newUserObject()
    scoring.setModel model

  it 'sets correct user defaults', ->
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
  describe 'Tasks', ->
    uuid = null
    taskPath = null
    
    ## Helper which clones the content at a path so tests can compare before/after values
    # Otherwise, using model.get(path) will give the same object before as after
    pathSnapshots = (paths) ->
      if _.isString(paths)
        return _.clone(model.get(paths)) 
      _.map paths, (path) -> _.clone(model.get(path))
    statsTask = -> pathSnapshots(['_user.stats', taskPath]) # quick snapshot of user.stats & task
    
    before ->
      # Reset tasks
      model.set '_user.tasks', {}
      model.set '_user.habitIds', []
      model.set '_user.dailyIds', []
      model.set '_user.todoIds', []
      model.set '_user.rewardIds', []
    
    describe 'Habits', ->
    
      beforeEach ->
        # create a test task
        uuid = derby.uuid()
        taskPath = "_user.tasks.#{uuid}"
        model.refList "_habitList", "_user.tasks", "_user.habitIds"
        model.at('_habitList').push {type: 'habit', text: 'Habit', value: 0, up: true, down: true, id: uuid}
      
      it 'created the habit', ->
        task = model.get(taskPath)
        expect(task.text).to.eql 'Habit'
        expect(task.value).to.eql 0
        
      it 'made proper modifications when down-scored', ->
        ## Trial 1
        [statsBefore, taskBefore] = statsTask()
        scoring.score(uuid, 'down')
        [statsAfter, taskAfter] = statsTask()
        
        # User should have lost HP 
        expect(statsAfter.hp).to.be.lessThan statsBefore.hp
        # Exp, GP should stay the same
        expect(statsAfter.money).to.eql statsBefore.money
        expect(statsAfter.exp).to.eql statsBefore.exp
        
        # Task should have gained in value (we're going down, so think Math.abs(task.value))
        expect(taskBefore.value).to.eql 0
        expect(taskAfter.value).to.eql -1
        
        ## Trial 2
        taskBefore = pathSnapshots(taskPath)        
        scoring.score(uuid, 'down')
        taskAfter = pathSnapshots(taskPath)
        # Should have gained in value
        expect(taskAfter.value).to.be < taskBefore.value
        # And gained more than trial 1
        diff = Math.abs(taskAfter.value) - Math.abs(taskBefore.value)
        expect(diff).to.be.greaterThan 1
        
      it 'made proper modifications when up-scored', ->
        # Up-score the habit
        [statsBefore, taskBefore] = statsTask()
        scoring.score(uuid, 'up')
        [statsAfter, taskAfter] = statsTask()
        
        # User should have gained Exp, GP 
        expect(statsAfter.exp).to.be.greaterThan statsBefore.exp
        expect(statsAfter.money).to.be.greaterThan statsBefore.money
        # HP should not change
        expect(statsAfter.hp).to.eql statsBefore.hp
        # Task should have lost value
        expect(taskBefore.value).to.eql 0
        expect(taskAfter.value).to.be.lessThan 1
        
      it 'makes history entry for habit'      
      it 'makes proper modifications each time when clicking + / - in rapid succession'
      # saw an issue here once, so test that it wasn't a fluke
     
      it 'should not modify certain attributes given certain conditions'
        # non up+down habits
        # what else?
        
      it 'should show "undo" notification if user unchecks completed daily'
      
    describe 'Dailies', ->
      
      beforeEach ->
        # create a test task
        uuid = derby.uuid()
        taskPath = "_user.tasks.#{uuid}"
        model.refList "_dailyList", "_user.tasks", "_user.dailyIds"
        model.at('_dailyList').push {type: 'daily', text: 'Daily', value: 0, completed: false, id: uuid }
        
      it 'created the daily', ->
        task = model.get(taskPath)
        expect(task.text).to.eql 'Daily'
        expect(task.value).to.eql 0
        
      it 'does proper calculations when daily is complete'
      
      it 'calculates user.stats & task.value properly on cron', ->
        [statsBefore, taskBefore] = statsTask()
        # Set lastCron to yesterday
        today = new moment()
        yesterday = new moment().subtract('days',1)
        model.set '_user.lastCron', yesterday.toDate()
        # Run run
        scoring.cron() 
        [statsAfter, taskAfter] = statsTask()
        
        # Should have updated cron to today
        lastCron = moment(model.get('_user.lastCron'))
        expect(today.diff(lastCron, 'days')).to.eql 0
        
        # Should have updated points properly
        expect(statsBefore.hp).to.be.greaterThan statsAfter.hp
        expect(taskBefore.value).to.eql 0
        expect(taskAfter.value).to.eql -1
         
      #TODO clicking repeat dates on newly-created item doesn't refresh until you refresh the page
      #TODO dates on dailies is having issues, possibility: date cusps? my saturday exempts were set to exempt at 8pm friday
    
    describe 'Todos', ->
      describe 'Cron', ->
        it 'calls cron asyncronously'
        it 'should calculate user.stats & task.value properly on cron'
        it 'should calculate cron based on difference between start-of-days, and not run in the middle of the day'
        it 'should only run set operations once per task, even when daysPassed > 1'
        # pass in daysPassed to score, multiply modification values by daysPassed before running set
        it 'should only push a history point for lastCron, not each day in between'
        # stop passing in tallyFor, let moment().sod().toDate() be handled in scoring.score()
        it 'should defer saving user modifications until, save as aggregate values'
        # pass in commit parameter to scoring func, if true save right away, otherwise return aggregated array so can save in the end (so total hp loss, etc)
    
    describe 'Rewards', ->
      
  describe 'Lvl & Items', ->        
    it 'modified damage based on lvl & armor' 
    it 'always decreases hp with damage, regardless of stats/items'
    it 'always increases exp/gp with gain, regardless of stats/items'
  
  #### Require.js stuff, might be necessary to place in casper.coffee
  it "doesn't setup dependent functions until their modules are loaded, require.js callback"
  # sortable, stripe, etc 

#TODO refactor as user->habits, user->dailys, user->todos, user->rewards