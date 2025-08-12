###
Huge migration:
- Customization Redo: https://trello.com/c/YKXmHNjY/306-customization-redo
- Armory: https://trello.com/c/83M5RqQB/299-armory
- Classes
###
mongo = require('mongoskin')
_ = require('lodash')
async = require('async')

# IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
# We've now upgraded to lodash v4 but the code used in this migration has not been
# adapted to work with it. Before this migration is used again any lodash method should
# be checked for compatibility against the v4 changelog and changed if necessary.
# https://github.com/lodash/lodash/wiki/Changelog#v400

db = mongo.db('localhost:27017/habitrpg?auto_reconnect')

###
  Migrate users
###
query = {migration:{$ne:'20131214_classes'}}
users = db.collection('users')
users.count query, (err, count) ->
  console.log {count}
  return console.error(err) if err
  users.findEach query, {batchSize:500}, (err, user) ->
    unless user then err = 'Blank user';count--
    return console.log(err) if err

    # --------- Misc ---------
    user.stats ?= {}
    _.defaults user.purchased, {hair: {}, skin: {}, balance: 0}
    user.preferences.sleep = user.flags.rest
    delete user.flags.rest
    delete user.preferences.armorSet

    # --------- Class System ---------
    _.defaults user.stats,
      class: "warrior"
      str: 0
      con: 0
      int: 0
      per: 0
      buffs: {}
      points: user.stats.lvl
      mp: (user.stats.lvl - 1) / 2 + 10
    user.flags.classSelected = false

    # --------- Gender ---------
    user.preferences.size = if (user.preferences.gender is "f") then "slim" else "broad"
    user.preferences.shirt = if (user.preferences.gender is "f") then "pink" else "white"
    user.preferences.hair =
      color: user.preferences.hair
      base:  if user.preferences.gender is "f" then 1 else 0
      bangs: if user.preferences.gender is "f" then 1 else 3
      beard: 0
      mustache: 0

    delete user.preferences.gender

    # --------- Skin (see https://trello.com/c/YKXmHNjY/306-customization-redo) ---------
    user.preferences.skin = switch user.preferences.skin
      when "asian" then "ddc994"
      when "white" then "f5a76e"
      when "black" then "915533"
      when "dead"  then "c3e1dc"
      when "orc"   then "6bd049"
      else user.preferences.skin

    # --------- Gear ---------
    gear =
      owned: {}
      equipped: {}
      costume: {}

    _.each {head: "showHelm", weapon: "showWeapon", shield: "showShield", armor: "showArmor"}, (show, type) ->
      user.items[type] = unless 0 < ~~user.items[type] < 9 then 0 else ~~user.items[type]
      _.times user.items[type]+1, (i) -> #+1 since 0 is significant
        item =
          if type is 'weapon'
            if i > 8 then 'weapon_warrior_6'
            else if i is 8 then "weapon_special_1"
            else if i is 7 then "weapon_special_0"
            else "weapon_warrior_#{i}"
          else
            if i > 7 then "#{type}_warrior_5"
            else if i is 7 then "#{type}_special_1"
            else if i is 6 then "#{type}_special_0"
            else if i is 0 then "#{type}_base_0"
            else "#{type}_warrior_#{i}"
        gear.owned[item] = true unless item is "#{type}_base_0"
        gear.equipped[type] = item

  #      # TODO how to handle combo of wearing / hiding?
  #      if user.preferences[show] is false
  #        gear.costume[type] = type + '_base_0';
  #        user.preferences.costume = true;

      delete user.preferences[show]
      delete user.items[type]
    user.items.gear = gear

    # --------- Tasks ---------
    _.each user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards), (task) ->
      # migrate task.priority from !, !!, !!! => 1, 1.5, 2
      task.priority = switch task.priority
        when "!!!" then 2
        when "!!" then 1.5
        else 1

      # Add task attributes
      task.attribute = "str"

    user.migration = '20131214_classes'
    users.update {_id: user._id}, user
    console.log("USERS DONE") if --count <= 0
    console.log(count) if count%1000 is 0
    console.log('lefnire processed') if user._id is '9'

###
  Need to also migrate challenges.tasks
###
challenges = db.collection('challenges')
challenges.count (err, count) ->
  return console.error(err) if err
  challenges.findEach {}, {batchSize:500}, (err, challenge) ->
    unless challenge then err = 'Blank challenge';count--
    return console.log(err) if err
    _.each challenge.habits.concat(challenge.dailys).concat(challenge.todos).concat(challenge.rewards), (task) ->
      # migrate task.priority from !, !!, !!! => 1, 1.5, 2
      task.priority = switch task.priority
        when "!!!" then 2
        when "!!" then 1.5
        else 1
      # Add task attributes
      task.attribute = "str"
    challenges.update {_id: challenge._id}, challenge
    console.log("CHALLENGES DONE") if --count <= 0