/**
 * Set this up as a midnight cron script
 *
 * mongo habitrpg ./migrations/20130908_remove_staged_users.js
 */

/**
 * If we experience any troubles with removed staging users, come back to a snapshot and restore accounts. This will
 * give a peak into possible conflict accounts:
 */
/* db.users.count({
  "auth.local": {$exists: false},
  "auth.facebook": {$exists: false},
  "history.exp.5": {$exists: 1},
  $where: "this.todoIds.length != 1 && this.dailyIds.length != 3 && this.habitIds.length != 3 && this.rewardIds.length != 2"
})*/

/**
 * Users used to be allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
 * "staged" account is created - and if the user later registers, that staged account is considered a "production" account.
 * This function removes all staged accounts, since the new site doesn't supported staged accounts, and when we add that feature
 * in we'll be using localStorage anyway instead of creating a new database record
 */
db.users.remove({
  // Un-registered users
  'auth.local': {$exists: false},
  'auth.facebook': {$exists: false},
});

/**
 * Remove empty parties
 * Another vestige of Racer. Empty parties shouldn't be being created anymore in the new site
 */
db.groups.remove({
  type: 'party',
  $where: 'return this.members.length === 0',
});