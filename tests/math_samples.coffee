###

1) clone the repo
2) npm install
3) coffee ./node_modules/habitrpg-shared/tests/math_samples.coffee

exp here is `gained/TNL`

   lvl		exp		    hp		  gp		task.value
   1		  8/150		  50		  1.06		1.16 (↑ Δ1.00)
   1		  8/150		  49.1		1.06		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   11		17/280		  50		  1.96		1.24 (↑ Δ1.00)
   11		17/280		  49.2		1.96		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   21		115/460		  50		  13.23		1.31 (↑ Δ1.00)
   21		115/460		  49.2		13.23		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   31		33/690		  50		  3.76		1.39 (↑ Δ1.00)
   31		33/690		  49.3		3.76		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   41		42/970		  50		  4.66		1.46 (↑ Δ1.00)
   41		42/970		  49.3		4.66		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   51		50/1300		  50		  5.56		1.54 (↑ Δ1.00)
   51		50/1300		  49.4		5.56		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   61		59/1680		  50		  6.46		1.61 (↑ Δ1.00)
   61		59/1680		  49.5		6.46		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   71		67/2110		  50		  7.36		1.69 (↑ Δ1.00)
   71		67/2110		  49.5		7.36		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   81		76/2590		  50		  8.26		1.76 (↑ Δ1.00)
   81		76/2590		  49.6		8.26		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
   91		84/3120		  50		  9.16		1.84 (↑ Δ1.00)
   91		84/3120		  49.6		9.16		-1.00 (↓ Δ-1.00)
   ------------------------------------------------------------
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
    shared.taskDefaults({id, value: -4})
  ]
  dailys: []
  todos: []
  rewards: []

shared.wrap(user)
s = user.stats
task = user.tasks[id]
party = [user]

clearUser = (i=1) ->
  _.merge user.stats, {exp:0, gp:0, hp:50, lvl:i, str:i, con:i, per:i, int:i, mp: 100}
  _.merge s.buffs, {str:0,con:0,int:0,per:0}

_.times 10, (n) ->
  console.log "lvl\t\texp\t\thp\t\tgp\t\ttask.value"
  i = n*10 + 1
  clearUser(i)
  task.value = 0
  delta = user.ops.score params:{id, direction:'up'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(s.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{task.value.toFixed(2)} (↑ Δ#{delta.toFixed(2)})"

  task.value = 0
  delta = user.ops.score params:{id, direction:'down'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(s.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{task.value.toFixed(2)} (↓ Δ#{delta.toFixed(2)})"

  console.log '[Wizard]'

  task.value = 0;clearUser(i)
  shared.content.spells.wizard.fireball.cast(user,task)
  console.log "fireball: task.value=#{task.value} hp=#{s.exp}"

  task.value = 0;clearUser(i)
  shared.content.spells.wizard.mpheal.cast(user,party)
  console.log "mpheal: mp=#{s.mp} (from 100)"

  task.value = 0;clearUser(i)
  shared.content.spells.wizard.earth.cast(user,party)
  console.log "earth: buffs.int=#{s.buffs.int}"

  task.value = 0;clearUser(i)
  shared.content.spells.wizard.frost.cast(user,{})
  console.log "frost: -"

  console.log '[Warrior]'

  task.value = 0;clearUser(i)
  shared.content.spells.warrior.smash.cast(user,task)
  console.log "smash: task.value=#{task.value}"

  task.value = 0;clearUser(i)
  shared.content.spells.warrior.defensiveStance.cast(user,{})
  console.log "defensiveStance: buffs.con=#{s.buffs.con}"

  task.value = 0;clearUser(i)
  shared.content.spells.warrior.valorousPresence.cast(user,party)
  console.log "valorousPresence: buffs.str=#{s.buffs.str}"

  task.value = 0;clearUser(i)
  shared.content.spells.warrior.intimidate.cast(user,party)
  console.log "intimidate: buffs.con=#{s.buffs.con}"

  console.log '[Rogue]'

  task.value = 0;clearUser(i)
  shared.content.spells.rogue.pickPocket.cast(user,task)
  console.log "pickPocket: gp=#{s.gp}"

  task.value = 0;clearUser(i)
  shared.content.spells.rogue.backStab.cast(user,task)
  console.log "backStab: task.value=#{task.value} exp=#{s.exp} gp=#{s.gp}"

  task.value = 0;clearUser(i)
  shared.content.spells.rogue.toolsOfTrade.cast(user,party)
  console.log "toolsOfTrade: buffs.per=#{s.buffs.per}"

  task.value = 0;clearUser(i)
  shared.content.spells.rogue.stealth.cast(user,{})
  console.log "stealth: -"

  console.log '[Healer]'

  task.value = 0;clearUser(i)
  s.hp=0
  shared.content.spells.healer.heal.cast(user,{})
  console.log "heal: hp=#{s.hp}"

  task.value = 0;clearUser(i)
  shared.content.spells.healer.brightness.cast(user,{})
  console.log "brightness: task.value=#{task.value}"

  task.value = 0;clearUser(i)
  shared.content.spells.healer.protectAura.cast(user,party)
  console.log "protectAura: buffs.con=#{s.buffs.con}"

  task.value = 0;clearUser(i)
  s.hp=0
  shared.content.spells.healer.heallAll.cast(user,party)
  console.log "heallAll: hp=#{s.hp}"


  console.log '------------------------------------------------------------'



