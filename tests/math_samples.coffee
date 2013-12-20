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



