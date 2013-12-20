###
1) clone the repo
2) npm install
3) coffee ./tests/math_samples.coffee

Current results at https://gist.github.com/lefnire/8049676
###

shared = require '../script/index.coffee'
_ = require 'lodash'

id = shared.uuid()
user =
  stats: {class: 'warrior', buffs: {per:0,int:0,con:0,str:0}}
  items:
    eggs: {}
    hatchingPotions: {}
    food: {}
    gear:
      equipped:
        weapon: 'weapon_warrior_4'
        armor:  'armor_warrior_4'
        shield: 'shield_warrior_4'
        head:   'head_warrior_4'
  habits: [
    shared.taskDefaults({id, value: 0})
  ]
  dailys: []
  todos: []
  rewards: []

shared.wrap(user)
s = user.stats
task = user.tasks[id]
party = [user]
taskValue = -10

clearUser = (i=1) ->
  _.merge user.stats, {exp:0, gp:0, hp:50, lvl:i, str:i, con:i, per:i, int:i, mp: 100}
  _.merge s.buffs, {str:0,con:0,int:0,per:0}

_.times 10, (n) ->
  console.log "lvl\t\texp\t\thp\t\tgp\t\ttask.value"
  i = n*10 + 1
  clearUser(i)
  task.value = taskValue
  delta = user.ops.score params:{id, direction:'up'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(s.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{task.value.toFixed(2)} (↑ Δ#{delta.toFixed(2)})"

  task.value = taskValue
  delta = user.ops.score params:{id, direction:'down'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(s.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{task.value.toFixed(2)} (↓ Δ#{delta.toFixed(2)})"

  console.log '[Wizard]'

  task.value = taskValue;clearUser(i)
  shared.content.spells.wizard.fireball.cast(user,task)
  console.log "fireball: task.value=#{task.value} hp=#{s.exp}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.wizard.mpheal.cast(user,party)
  console.log "mpheal: mp=#{s.mp} (from 100)"

  task.value = taskValue;clearUser(i)
  shared.content.spells.wizard.earth.cast(user,party)
  console.log "earth: buffs.int=#{s.buffs.int}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.wizard.frost.cast(user,{})
  console.log "frost: -"

  console.log '[Warrior]'

  task.value = taskValue;clearUser(i)
  shared.content.spells.warrior.smash.cast(user,task)
  console.log "smash: task.value=#{task.value}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.warrior.defensiveStance.cast(user,{})
  console.log "defensiveStance: buffs.con=#{s.buffs.con}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.warrior.valorousPresence.cast(user,party)
  console.log "valorousPresence: buffs.str=#{s.buffs.str}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.warrior.intimidate.cast(user,party)
  console.log "intimidate: buffs.con=#{s.buffs.con}"

  console.log '[Rogue]'

  task.value = taskValue;clearUser(i)
  shared.content.spells.rogue.pickPocket.cast(user,task)
  console.log "pickPocket: gp=#{s.gp}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.rogue.backStab.cast(user,task)
  console.log "backStab: task.value=#{task.value} exp=#{s.exp} gp=#{s.gp}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.rogue.toolsOfTrade.cast(user,party)
  console.log "toolsOfTrade: buffs.per=#{s.buffs.per}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.rogue.stealth.cast(user,{})
  console.log "stealth: avoiding #{user.stats.buffs.stealth} tasks"

  console.log '[Healer]'

  task.value = taskValue;clearUser(i)
  s.hp=0
  shared.content.spells.healer.heal.cast(user,{})
  console.log "heal: hp=#{s.hp}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.healer.brightness.cast(user,{})
  console.log "brightness: task.value=#{task.value}"

  task.value = taskValue;clearUser(i)
  shared.content.spells.healer.protectAura.cast(user,party)
  console.log "protectAura: buffs.con=#{s.buffs.con}"

  task.value = taskValue;clearUser(i)
  s.hp=0
  shared.content.spells.healer.heallAll.cast(user,party)
  console.log "heallAll: hp=#{s.hp}"


  console.log '------------------------------------------------------------'



