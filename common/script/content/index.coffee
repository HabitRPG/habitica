api = module.exports

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
  tree: gear.tree
  flat: gear.flat

###
  Time Traveler Store, mystery sets need their items mapped in
###

api.timeTravelerStore = require('../../dist/scripts/content/time-traveler-store')

###
  ---------------------------------------------------------------
  Unique Rewards: Potion and Armoire
  ---------------------------------------------------------------
###

api.potion = require('../../dist/scripts/content/health-potion')

api.armoire = require('../../dist/scripts/content/armoire')

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
