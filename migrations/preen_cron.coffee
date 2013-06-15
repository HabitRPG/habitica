###
 Set this up as a midnight cron script
 coffee migrate.coffee -f "preen_cron"
###

_ = require('lodash')
moment = require('moment')
async = require('async')
today = +new Date
minHistLen = 7

module.exports = (db, allMigrationsComplete) ->

  doneCounter = 0
  oneMigrationDown = (err, results) ->
    throw err if err
    console.log 'One migration down'
    allMigrationsComplete() if ++doneCounter is 3

  users = db.collection('users')

  ###
   Remove empty parties
  ###
  db.collection('groups').remove
    $where: -> @type is 'party' and @members.length is 0
  , oneMigrationDown

  ###
   Users are allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
   "staged" account is created - and if the user later registers, that staged account is considered a "production" account.
   This function removes all staged accounts that have been abandoned - either older than a month, or corrupted in
   some way (lastCron==undefined)
  ###
  $statingUsersQ = async.queue (user, done) ->
    lastCron = user.lastCron;
    if lastCron && moment(lastCron).isValid()
      if Math.abs(moment(today).diff(lastCron, 'days')) > 5
        users.remove {_id: user._id}, done
      else done()
    else
      users.update {_id: user._id}, {$set: {'lastCron': today}}, done
  , 1000
  $statingUsersQ.drain = oneMigrationDown #final callback

  users.find({
    # Un-registered users
    "auth.local": {$exists: false}
    "auth.facebook": {$exists: false}
  }).each (err, user) ->
    throw err if err
    $statingUsersQ.push(user)


  ###
   Preen history for users with > 7 history entries
   This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
   of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 4 entries for last
   4 weeks; 12 entries for last 12 months; 1 entry per year before that: [day*7 week*4 month*12 year*infinite]
  ###
  preenHistory = (history) ->
      history = _.filter(history, (h) -> !!h) # discard nulls (corrupted somehow)
      newHistory = []
      preen = (amount, groupBy) ->
          groups = _(history)
              .groupBy((h) -> moment(h.date).format(groupBy)) # get date groupings to average against
              .sortBy((h,k) -> k) # sort by date
              .value() # turn into an array
          amount++; # if we want the last 4 weeks, we're going 4 weeks back excluding this week. so +1 to account for exclusion
          start = if (groups.length - amount > 0) then groups.length - amount else 0
          groups = groups.slice(start, groups.length - 1)
          _.each groups, (group) ->
            avg = _.reduce(group, ((mem, obj) -> mem + obj.value), 0) / group.length;
            newHistory.push {date: +moment(group[0].date), value: avg}

      preen(50, 'YYYY') # last 50 years
      preen(12, 'YYYYMM') # last 12 months
      preen(4, 'YYYYww') # last 4 weeks
      newHistory = newHistory.concat history.slice(-7) # last 7 days
      return newHistory

  $preenHistoryQ = async.queue (user, done) ->
    update = {$set:{}}

    _.each user.tasks, (task) ->
      if task.history?.length > minHistLen
        update['$set']['tasks.' + task.id + '.history'] = preenHistory(task.history)

    if user.history?.exp?.length > minHistLen
      update['$set']['history.exp'] = preenHistory(user.history.exp)
    if user.history?.todos?.length > minHistLen
      update['$set']['history.todos'] = preenHistory(user.history.todos)

    if _.isEmpty(update['$set']) then done()
    else users.update {_id: user._id}, update, done
  , 1000
  $preenHistoryQ.drain = oneMigrationDown

  users.find({
      # Registered users with some history
      $or: [
          { 'auth.local': { $exists: true }},
          { 'auth.facebook': { $exists: true }}
      ],
      'history': {$exists: true}
  }).each (err, user) ->
    throw err if err
    $preenHistoryQ.push(user)

#    /**
#     * Don't remove missing user auths anymore. This was previously necessary due to data corruption,
#     * revisit if needs be
#     */
#    /*db.sessions.find().forEach(function(sess){
#     var uid = JSON.parse(sess.session).userId;
#     if (!uid || db.users.count({_id:uid}) === 0) {
#     db.sessions.remove({_id:sess._id});
#     }
#     });*/

