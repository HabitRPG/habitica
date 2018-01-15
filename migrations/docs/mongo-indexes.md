# Indexes

This file contains a list of indexes that are on Habitica's production Mongo server.
If we ever have an issue, use this list to reindex.

## Challenges
 - `{ "group": 1, "official": -1, "timestamp": -1 }`
 - `{ "leader": 1, "official": -1, "timestamp": -1 }`
 - `{ "official": -1, "timestamp": -1 }`

## Groups
 - `{ "privacy": 1, "type": 1, "memberCount": -1 }`
 - `{ "privacy": 1 }`
 - `{ "purchased.plan.customerId": 1 }`
 - `{ "purchased.plan.paymentMethod": 1 }`
 - `{ "purchased.plan.planId": 1, "purchased.plan.dateTerminated": 1 }`
 - `{ "type": 1, "memberCount": -1, "_id": 1 }`
 - `{ "type": 1 }`

## Tasks
 - `{ "challenge.id": 1 }`
 - `{ "challenge.taskId": 1 }`
 - `{ "group.id": 1 }`
 - `{ "group.taskId": 1 }`
 - `{ "type": 1, "everyX": 1, "frequency": 1 }`
 - `{ "userId": 1 }`
 - `{ "yesterDaily": 1, "type": 1 }`

## Users
 - `{ "_id": 1, "apiToken": 1 }`
 - `{ "auth.facebook.emails.value": 1 }`
 - `{ "auth.facebook.id": 1 }`
 - `{ "auth.google.emails.value": 1 }`
 - `{ "auth.google.id": 1 }`
 - `{ "auth.local.email": 1 }`
 - `{ "auth.local.lowerCaseUsername": 1 }`
 - `{ "auth.local.username": 1 }`
 - `{ "auth.timestamps.created": 1 }`
 - `{ "auth.timestamps.loggedin": 1, "_lastPushNotification": 1, "preferences.timezoneOffset": 1 }`
 - `{ "auth.timestamps.loggedin": 1 }`
 - `{ "backer.tier": -1 }`
 - `{ "challenges": 1, "_id": 1 }`
 - `{ "contributor.admin": 1, "contributor.level": -1, "backer.npc": -1, "profile.name": 1 }`
 - `{ "contributor.level": 1 }`
 - `{ "flags.newStuff": 1 }`
 - `{ "guilds": 1, "_id": 1 }`
 - `{ "invitations.guilds.id": 1, "_id": 1 }`
 - `{ "invitations.party.id": 1 }`
 - `{ "loginIncentives": 1 }`
 - `{ "migration": 1 }`
 - {` "party._id": 1, "_id": 1 }`
 - `{ "preferences.sleep": 1, "_id": 1, "flags.lastWeeklyRecap": 1, "preferences.emailNotifications.unsubscribeFromAll": 1, "preferences.emailNotifications.weeklyRecaps": 1 }`
 - `{ "preferences.sleep": 1, "_id": 1, "lastCron": 1, "preferences.emailNotifications.importantAnnouncements": 1, "preferences.emailNotifications.unsubscribeFromAll": 1, "flags.recaptureEmailsPhase": 1 }`
 - `{ "profile.name": 1 }`
 - `{ "purchased.plan.customerId": 1 }`
 - `{ "purchased.plan.paymentMethod": 1 }`
 - `{ "stats.score.overall": 1 }`
 - `{ "webhooks.type": 1 }`
