'use strict'
TEST_DB = process.env.DB_NAME = 'habitrpg_migration_test'
process.env.NODE_DB_URI = 'mongodb://localhost/' + TEST_DB

app = require('../../website/server/server')
sh = require('shelljs')

runMigration = ->
  sh.exec 'node ./migrations/20150604_ultimateGearSets.js'

describe 'Backfill for granting ultimate gear sets achievement', ->
  before (done) ->
    sh.exec "mongo \"#{TEST_DB}\" --eval \"db.dropDatabase()\""
    done()

  context 'User without any purchased equipment', ->
    before (done) ->
      registerNewUser done, true

    it 'does not update user', (done)->
      user_gear = user.items.gear.owned
      expect(user_gear.weapon_wizard_6).to.not.exist
      expect(user.achievements.ultimateGearSets).to.not.exist
      
      runMigration()
      User.findById user._id, (err, _user) ->
        user = _user
        expect(user.achievements.ultimateGearSets).to.not.exist
        done()

  context 'User with all but one needed piece of equipment', ->
    before (done) ->
      registerNewUser ->
        items = {
          weapon_wizard_6: true
          armor_wizard_5: true
        }
        
        User.findByIdAndUpdate user._id, {'items.gear.owned': items}, (err, _user) -> 
          user = _user
          done()
      , true

    it 'does not update user', (done)->
      
      runMigration()

      User.findById user._id, (err, _user) ->
        user = _user
        expect(user.achievements.ultimateGearSets).to.not.exist
        done()

  context 'User with all necessary equipment', ->
    before (done) ->
      registerNewUser ->
        items = {
          weapon_wizard_6: true
          armor_wizard_5: true
          head_wizard_5: true
        }
        
        User.findByIdAndUpdate user._id, {'items.gear.owned': items}, (err, _user) -> 
          user = _user
          done()
      , true

    it 'grants user ultimate gear', (done)->
      
      runMigration()

      User.findById user._id, (err, _user) ->
        user = _user
        expect(user.achievements.ultimateGearSets.wizard).to.exist
        done()
