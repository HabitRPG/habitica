/*
  DEFINE BEFORE MIGRATING

  tasks: userId OK (sparse?), challenge.id OK (sparse?), challenge.taskId OK (sparse?), type? completed?
  users:
    id & apiToken, OK
    auth.facebook.emails.value OK -> unique and sparse?,
    auth.facebook.id - unique and sparse, OK
    auth.local.email - unique and sparse, OK
    auth.local.lowerCaseUsername, OK
    auth.local.username - unique OK
    auth.local.username & auth.local.hashed_password?,
    auth.timestamps.created?, OK
    auth.timestamps.loggedin?, OK
    backer.tier -1 OK
    { "contributor.admin" : 1 , "contributor.level" : -1 , "backer.npc" : -1 , "profile.name" : 1}
    { "contributor.admin" : 1.0} NO, see ^
    { "contributor.level" : 1.0} OK
    { "contributor.level" : 1.0 , "purchased.plan.customerId" : 1.0} ?
    NO { "flags.lastWeeklyRecap" : 1 , "_id" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "preferences.emailNotifications.weeklyRecaps" : 1}
    { "invitations.guilds.id" : 1} OK
    { "invitations.party.id" : 1} OK
    OK { "preferences.sleep" : 1 , "_id" : 1 , "flags.lastWeeklyRecap" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "preferences.emailNotifications.weeklyRecaps" : 1}
    OK { "preferences.sleep" : 1 , "_id" : 1 , "lastCron" : 1 , "preferences.emailNotifications.importantAnnouncements" : 1 , "preferences.emailNotifications.unsubscribeFromAll" : 1 , "flags.recaptureEmailsPhase" : 1}
    profile.name ? OK
    { "purchased.plan.customerId" : 1.0} OK
    { "purchased.plan.paymentMethod" : 1.0} OK

    guilds OK
    party.id OK
    challenges OK
  challenges:
    { "_id" : 1.0 , "__v" : 1.0} ? NO
    { "_id" : 1.0 , "official" : -1.0 , "timestamp" : -1.0}
    { "group" : 1.0 , "official" : -1.0 , "timestamp" : -1.0} OK
    { "leader" : 1.0 , "official" : -1.0 , "timestamp" : -1.0} OK
    { "members" : 1.0 , "official" : -1.0 , "timestamp" : -1.0} ? NO
    { "official" : -1 , "timestamp" : -1} ?
    { "official" : -1 , "timestamp" : -1, "_id": 1} ?
  groups:
    { "_id" : 1 , "quest.key" : 1} ?
    { "_id" : 1.0 , "__v" : 1.0} ?
    { "_id" : 1.0 , "privacy" : 1.0 , "members" : 1.0} ? NO
    { "members" : 1.0 , "type" : 1.0 , "memberCount" : -1.0} ? NO
    { "members" : 1} ? NO
    { "privacy" : 1.0 , "memberCount" : -1.0} ?
    { "privacy" : 1.0} OK
    { "type" : 1 , "privacy" : 1} ?
    { "type" : 1.0 , "members" : 1.0} ? NO
    { "type" : 1} ? OK
  emailUnsubscriptions: email unique OK
*/
