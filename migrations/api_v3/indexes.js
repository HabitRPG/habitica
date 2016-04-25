/*
  DEFINE BEFORE MIGRATING

  tasks: userId (sparse?), challenge.id (sparse), challenge.taskId (sparse), type? completed?
  users:
    id & apiToken?,
    auth.facebook.emails.value -> unique and sparse?,
    auth.facebook.id - unique and sparse,
    auth.local.email - unique and sparse,
    auth.local.lowerCaseUsername,
    auth.local.username - unique and sparse
    auth.local.username & auth.local.hashed_password?,
    auth.timestamps.created?,
    auth.timestamps.loggedin?,
    backer.tier -1
    { "contributor.admin" : 1 , "contributor.level" : -1 , "backer.npc" : -1 , "profile.name" : 1}
    { "contributor.admin" : 1.0}
    { "contributor.level" : 1.0}
    { "contributor.level" : 1.0 , "purchased.plan.customerId" : 1.0} ?
    { "flags.lastWeeklyRecap" : 1 , "_id" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "preferences.emailNotifications.weeklyRecaps" : 1}
    { "invitations.guilds.id" : 1}
    { "invitations.party.id" : 1}
    { "preferences.sleep" : 1 , "_id" : 1 , "flags.lastWeeklyRecap" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "preferences.emailNotifications.weeklyRecaps" : 1}
    { "preferences.sleep" : 1 , "_id" : 1 , "lastCron" : 1 , "preferences.emailNotifications.importantAnnouncements" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "flags.recaptureEmailsPhase" : 1}
    profile.name ?
    { "purchased.plan.customerId" : 1.0}
    { "purchased.plan.paymentMethod" : 1.0}

    guilds
    party.id
    challenges
  challenges:
    { "_id" : 1.0 , "__v" : 1.0} ?
    { "_id" : 1.0 , "official" : -1.0 , "timestamp" : -1.0}
    { "group" : 1.0 , "official" : -1.0 , "timestamp" : -1.0}
    { "leader" : 1.0 , "official" : -1.0 , "timestamp" : -1.0}
    { "members" : 1.0 , "official" : -1.0 , "timestamp" : -1.0} ?
    { "official" : -1 , "timestamp" : -1}
    { "official" : -1 , "timestamp" : -1, "_id": 1} ?
  groups:
    { "_id" : 1 , "quest.key" : 1}
    { "_id" : 1.0 , "__v" : 1.0} ?
    { "_id" : 1.0 , "privacy" : 1.0 , "members" : 1.0} ?
    { "members" : 1.0 , "type" : 1.0 , "memberCount" : -1.0} ?
    { "members" : 1} ?
    { "privacy" : 1.0 , "memberCount" : -1.0} ?
    { "privacy" : 1.0} ?
    { "type" : 1 , "privacy" : 1} ?
    { "type" : 1.0 , "members" : 1.0} ?
    { "type" : 1} ?
  emailUnsubscriptions: email unique
*/
