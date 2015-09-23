api = module.exports

_ = require 'lodash'
moment = require 'moment'

t = require('../../dist/scripts/content/helpers').translator

###
  ---------------------------------------------------------------
  Gear (Weapons, Armor, Head, Shield)
  Item definitions: {index, text, notes, value, str, def, int, per, classes, type}
  ---------------------------------------------------------------
###

classes = require('../../dist/scripts/content/classes')

events = require('../../dist/scripts/content/events')

api.mystery = require('../../dist/scripts/content/mystery-sets')

api.itemList = require('../../dist/scripts/content/item-list')

gear = require('../../dist/scripts/content/gear/index')

###
  The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
  they are needed in different forms at different points in the app
###
api.gear =
  tree: gear
  flat: gear.flat


###
  Time Traveler Store, mystery sets need their items mapped in
###
_.each api.mystery, (v,k)-> v.items = _.where api.gear.flat, {mystery:k}
api.timeTravelerStore = (owned) ->
  ownedKeys = _.keys owned.toObject?() or owned # mongoose workaround
  _.reduce api.mystery, (m,v,k)->
    return m if k=='wondercon' or ~ownedKeys.indexOf(v.items[0].key) # skip wondercon and already-owned sets
    m[k] = v;m
  , {}

###
  ---------------------------------------------------------------
  Unique Rewards: Potion and Armoire
  ---------------------------------------------------------------
###

api.potion =
  type: 'potion',
  text: t('potionText'),
  notes: t('potionNotes'),
  value: 25,
  key: 'potion'

api.armoire =
  type: 'armoire',
  text: t('armoireText'),
  notes: ((user, count)->
    return t('armoireNotesEmpty')() if (user.flags.armoireEmpty)
    return t('armoireNotesFull')() + count
  ),
  value: 100,
  key: 'armoire',
  canOwn: ((u)-> _.contains(u.achievements.ultimateGearSets, true))

###
   ---------------------------------------------------------------
   Classes
   ---------------------------------------------------------------
###

api.classes = classes

###
   ---------------------------------------------------------------
   Gear Types
   ---------------------------------------------------------------
###

api.gearTypes = gear.gearTypes

api.spells = require('../../dist/scripts/content/spells/index')

api.cardTypes = require('../../dist/scripts/content/card-types')

# Intercept all spells to reduce user.stats.mp after casting the spell
_.each api.spells, (spellClass) ->
  _.each spellClass, (spell, key) ->
    spell.key = key
    _cast = spell.cast
    spell.cast = (user, target) ->
      #return if spell.target and spell.target != (if target.type then 'task' else 'user')
      _cast(user,target)
      user.stats.mp -= spell.mana

api.special = api.spells.special

###
  ---------------------------------------------------------------
  Drops
  ---------------------------------------------------------------
###

eggs = require('../../dist/scripts/content/eggs/index')

api.dropEggs = eggs.dropEggs

api.questEggs = eggs.questEggs

api.eggs = eggs.allEggs

pets_mounts = require('../../dist/scripts/content/pets-mounts/index')

api.specialPets = pets_mounts.specialPets

api.specialMounts = pets_mounts.specialMounts

api.timeTravelStable = require('../../dist/scripts/content/time-traveler-stable')

api.hatchingPotions = require('../../dist/scripts/content/hatching-potions')

api.pets = pets_mounts.dropPets

api.questPets = pets_mounts.questPets

api.mounts = pets_mounts.dropMounts

api.questMounts = pets_mounts.questMounts

api.food = require('../../dist/scripts/content/food/index')

quests = require('../../dist/scripts/content/quests/index')

api.userCanOwnQuestCategories = quests.canOwnCategories

api.quests = quests.allQuests

api.questsByLevel = quests.byLevel

api.backgrounds = require('../../dist/scripts/content/backgrounds')

api.subscriptionBlocks = require('../../dist/scripts/content/subscription-blocks')

api.userDefaults = require('../../dist/scripts/content/user-defaults')

api.faq = require('../../dist/scripts/content/faq')

