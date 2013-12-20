###

1) fork the repo
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
console.log "lvl\t\texp\t\thp\t\tgp\t\ttask.value"
_.times 10, (n) ->
  i = n*10 + 1
  _.merge user.stats, {exp:0, gp:0, hp:50, lvl:i, str:i, con:i, per:i, int:i, mp: 50}
  user.tasks[id].value = 0
  delta = user.ops.score params:{id, direction:'up'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(user.stats.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{user.tasks[id].value.toFixed(2)} (↑ Δ#{delta.toFixed(2)})"

  user.tasks[id].value = 0
  delta = user.ops.score params:{id, direction:'down'}
  console.log "#{s.lvl}\t\t#{s.exp}/#{shared.tnl(user.stats.lvl)}\t\t#{s.hp}\t\t#{s.gp.toFixed(2)}\t\t#{user.tasks[id].value.toFixed(2)} (↓ Δ#{delta.toFixed(2)})"
  console.log '------------------------------------------------------------'



