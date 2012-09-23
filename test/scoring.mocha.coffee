{expect} = require 'derby/node_modules/racer/test/util'
{BrowserModel: Model} = require 'derby/node_modules/racer/test/util/model'
scoring = require '../src/app/scoring'
schema = require '../src/app/schema'
_ = require '../public/js/underscore-min' 


describe 'Scoring', ->
  model = null
  
  beforeEach ->
    model = new Model
    model.set '_user', schema.newUserObject()

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
