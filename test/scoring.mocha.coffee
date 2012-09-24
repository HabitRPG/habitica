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
    scoring.setUser model.at('_user')

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
    
  it 'should modify damage based on lvl & armor', ->
    user = model.at('_user')
    [lvl,armor] = [user.get('stats.lvl'), user.get('items.armor')]
    expect(lvl).to.eql 1
    expect(armor).to.eql 0
    
    uuid = derby.uuid()
    model.at('_user.tasks').push {type: 'habit', text: 'Habit', value: 0, up: true, down: true, id: uuid}
    task = model.get("_user.tasks")
    console.log task
    # modified = scoring.score
          
  it 'should always decrease hp with damage, regardless of stats/items'
  it 'should always increase exp/gp with gain, regardless of stats/items'
