mongoose = require("mongoose")
Schema = mongoose.Schema
helpers = require('habitrpg-shared/script/helpers')
_ = require('lodash')

UserSchema = new Schema(

  _id: {type: String, 'default': helpers.uuid}
  apiToken: {type: String, 'default': helpers.uuid}

  # We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  # have been updated (http://goo.gl/gQLz41), but we want *every* update
  _v: {type: Number, 'default': 0}

  achievements:
    originalUser: Boolean
    helpedHabit: Boolean
    ultimateGear: Boolean
    beastMaster: Boolean
    streak: Number

  auth:
    facebook: Schema.Types.Mixed
    local:
      email: String
      hashed_password: String
      salt: String
      username: String

    timestamps:
      created: {type: Date, 'default': Date.now}
      loggedin: Date

  backer: Schema.Types.Mixed # TODO
#    tier: Number
#    admin: Boolean
#    contributor: Boolean
#    tokensApplieds: Boolean

  balance: Number

  habitIds: Array
  dailyIds: Array
  todoIds: Array
  rewardIds: Array

  # Removed `filters`, no longer persisting to the database

  flags:
    ads: String #FIXME to boolean (currently show/hide)
    dropsEnabled: Boolean
    itemsEnabled: Boolean
    newStuff: String #FIXME to boolean (currently show/hide)
    partyEnabled: Boolean
    petsEnabled: Boolean
    rest: Boolean # FIXME remove?

  history:
    exp: [
      date: Date
      value: Number
    ]
    todos: [
      data: Date
      value: Number
    ]

  invitations: # FIXME remove?
    guilds: Array
    party: Schema.Types.Mixed

  items:
    armor: Number
    weapon: Number
    head: Number
    shield: Number
    currentPet: #FIXME - tidy this up, not the best way to store current pet
      text: String #Cactus
      name: String #Cactus
      value: Number #3
      notes: String #"Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.",
      modifier: String #Skeleton
      str: String #Cactus-Skeleton

    eggs: [
      text: String #"Wolf",
      name: String #"Wolf",
      value: Number #3
      notes: String #"Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet.",
      type: String #"Egg",
      dialog: String #"You've found a Wolf Egg! Find a hatching potion to pour on this egg, and one day it will hatch into a loyal pet." },
    ]
    hatchingPotions: Array # ["Base", "Skeleton",...]
    lastDrop:
      date: Date
      count: Number

    pets: Array # ["BearCub-Base", "Cactus-Base", ...]

  #FIXME store as Date?
  lastCron: {type: Number, 'default': +new Date}
  party: # FIXME remove?
    current: String #party._id FIXME make these populate docs?
    invitation: String #party._id
    lastMessageSeen: String #party._id
    leader: Boolean

  preferences:
    armorSet: String #"v2",
    dayStart: Number #"0", FIXME do we need a migration for this?
    gender: String # "m",
    hair: String #"blond",
    hideHeader: Boolean #false,
    showHelm: Boolean #true,
    skin: String #"white",
    timezoneOffset: Number #240

  profile:
    blurb: String #"I made Habit. Don't judge me! It'll get better, I promise",
    imageUrl: String #"https://sphotos-a-lga.xx.fbcdn.net/hphotos-ash4/1004403_10152886610690144_825305769_n.jpg",
    name: String #"Tyler",
    websites: Array #["http://ocdevel.com" ]

  stats:
    hp: Number
    exp: Number
    gp: Number
    lvl: Number

  tags: [
    id: String # FIXME use refs?
    name: String # "pomodoro"
  ]

  # We can't define `tasks` until we move off Derby, since Derby requires dictionary of objects. When we're off, migrate
  # to array of subdocs
  tasks: Schema.Types.Mixed
    # history: {date, value}
    # id
    # notes
    # tags { "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true },
    # text
    # type
    # up
    # down
    # value
    # completed
    # priority: '!!'
    # repeat {m: true, t: true}
    # streak
, {strict: true}) # 'throw'

###
  Derby requires a strange storage format for somethign called "refLists". Here we hook into loading the data, so we
  can provide a more "expected" storage format for our various helper methods. Since the attributes are passed by reference,
  the underlying data will be modified too - so when we save back to the database, it saves it in the way Derby likes.
  This will go away after the rewrite is complete
###
UserSchema.post 'init', (doc) ->

  # Fix corrupt values, FIXME we can remove this after off Derby
  _.each doc.tasks, (task, k) ->
    return delete doc.tasks[k] unless task?.id?
    task.value = 0 if isNaN(+task.value)
  _.each doc.stats, (v,k) ->
    doc.stats[k] = 0 if isNaN(+v)

  _.each ['habit','daily','todo','reward'], (type) ->
    # we use _.transform instead of a simple _.where in order to maintain sort-order
    doc["#{type}s"] = _.transform doc["#{type}Ids"], (result, tid) -> result.push(doc.tasks[tid])

#UserSchema.virtual('id').get () -> @_id
UserSchema.methods.toJSON = () ->
  doc = @toObject()
  doc.id = doc._id
  _.each ['habit','daily','todo','reward'], (type) ->
    # we use _.transform instead of a simple _.where in order to maintain sort-order
    doc["#{type}s"] = _.transform doc["#{type}Ids"], (result, tid) -> result.push(doc.tasks[tid])
    #delete doc["#{type}Ids"]
  #delete doc.tasks
  doc.filters = {}
  doc

# FIXME - since we're using special @post('init') above, we need to flag when the original path was modified.
# Custom setter/getter virtuals?
UserSchema.pre 'save', (next) ->
  @markModified('tasks')
  @._v++ #our own version incrementer
  next()

module.exports.schema = UserSchema
module.exports.model = mongoose.model("User", UserSchema)