###
1) clone the repo
2) npm install
3) coffee ./tests/math_samples.coffee

Current results at https://gist.github.com/lefnire/8049676
###

shared = require '../../script/index.coffee'
_ = require 'lodash'
$w = (s)->s.split(' ')

id = shared.uuid()
user =
  stats:
      class: 'warrior'
      lvl:1, hp:50, gp:0, exp:10
      per:0, int:0, con:0, str:0
      buffs: {per:0, int:0, con:0, str:0}
      training: {int:0,con:0,per:0,str:0}
  preferences: automaticAllocation: false
  party: quest: key:'evilsanta', progress: {up:0,down:0}
  achievements: {}
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
    # we're gonna change this habit's attribute to mess with taskbased allo. Add the others to make sure our _.reduce is legit
    {id:'a',value:1,type:'habit',attribute:'str'}
  ]
  dailys: [
    {id:'b',value:1,type:'daily',attribute:'str'}
  ]
  todos: [
    {id:'c',value:1,type:'todo',attribute:'con'}
    {id:'d',value:1,type:'todo',attribute:'per'}
    {id:'e',value:1,type:'todo',attribute:'int'}
  ]
  rewards: []

modes =
  flat: _.cloneDeep user
  classbased_warrior: _.cloneDeep user
  classbased_rogue: _.cloneDeep user
  classbased_wizard: _.cloneDeep user
  classbased_healer: _.cloneDeep user
  taskbased: _.cloneDeep user

modes.classbased_warrior.stats.class = 'warrior'
modes.classbased_rogue.stats.class = 'rogue'
modes.classbased_wizard.stats.class = 'wizard'
modes.classbased_healer.stats.class = 'healer'

_.each $w('flat classbased_warrior classbased_rogue classbased_wizard classbased_healer taskbased'), (mode) ->
  _.merge modes[mode].preferences,
    automaticAllocation: true
    allocationMode: if mode.indexOf('classbased') is 0 then 'classbased' else mode
  shared.wrap(modes[mode])

console.log "\n\n================================================"
console.log "New Simulation"
console.log "================================================\n\n"


_.times [20], (lvl) ->
  console.log ("[lvl #{lvl}]\n--------------\n")
  _.each $w('flat classbased_warrior classbased_rogue classbased_wizard classbased_healer taskbased'), (mode) ->
    u = modes[mode] #local var
    u.stats.exp = shared.tnl(lvl)+1 # level up
    _.merge u.stats, {per:0,con:0,int:0,str:0} if mode is 'taskbased' # if task-based, clear stat so we can see clearly which stat got +1
    u.habits[0].attribute = u.fns.randomVal({str:'str',int:'int',per:'per',con:'con'})
    u.ops.score {params:{id:u.habits[0].id},direction:'up'}
    u.fns.updateStats(u.stats) # trigger stats update
    str = mode + (if mode is 'taskbased' then " (#{u.habits[0].attribute})" else "")
    console.log str, _.pick(u.stats, $w 'per int con str')