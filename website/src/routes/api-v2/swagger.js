/*
---------- /api/v2 API ------------
see https://github.com/wordnik/swagger-node-express
Every url added to router is prefaced by /api/v2
Note: Many user-route ops exist in ../../common/script/index.js#user.ops, so that they can (1) be called both
client and server.
v1 user. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
 */

var user = require("../../controllers/api-v2/user");
var groups = require("../../controllers/api-v2/groups");
var members = require("../../controllers/api-v2/members");
var auth = require("../../controllers/api-v2/auth");
var hall = require("../../controllers/api-v2/hall");
var challenges = require("../../controllers/api-v2/challenges");
var dataexport = require("../../controllers/dataexport");
var nconf = require("nconf");
var cron = user.cron;
var _ = require('lodash');
var content = require('../../../../common').content;
var i18n = require('../../libs/i18n');
var forceRefresh = require('../../middlewares/forceRefresh').middleware;

module.exports = function(swagger, v2) {
  var path = swagger.pathParam;
  var body = swagger.bodyParam;
  var query = swagger.queryParam;

  swagger.setAppHandler(v2);
  swagger.setErrorHandler("next");
  swagger.setHeaders = function() {};
  swagger.configureSwaggerPaths("", "/api-docs", "");

  var api = {
    '/status': {
      spec: {
        description: "Returns the status of the server (up or down). Does not require authentication."
      },
      action: function(req, res) {
        return res.json({
          status: "up"
        });
      }
    },
    '/content': {
      spec: {
        description: "Get all available content objects. This is essential, since Habit often depends on item keys (eg, when purchasing a weapon). Does not require authentication.",
        parameters: [query("language", "Optional language to use for content's strings. Default is english.", "string")]
      },
      action: user.getContent
    },
    '/content/paths': {
      spec: {
        description: "Show user model tree. Does not require authentication."
      },
      action: user.getModelPaths
    },
    "/export/history": {
      spec: {
        description: "Export user history",
        method: 'GET'
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: dataexport.history
    },
    "/user/tasks/{id}/{direction}": {
      spec: {
        description: "Simple scoring of a task (Habit, Daily, To-Do, or Reward). This is most-likely the only API route you'll be using as a 3rd-party developer. The most common operation is for the user to gain or lose points based on some action (browsing Reddit, running a mile, 1 Pomodor, etc). Call this route, if the task you're trying to score doesn't exist, it will be created for you. When random events occur, the <b>user._tmp</b> variable will be filled. Critical hits can be accessed through <b>user._tmp.crit</b>. The Streakbonus can be accessed through <b>user._tmp.streakBonus</b>. Both will contain the multiplier value. When random drops occur, the following values are available: <b>user._tmp.drop = {text,type,dialog,value,key,notes}</b>",
        parameters: [path("id", "ID of the task to score. If this task doesn't exist, a task will be created automatically", "string"), path("direction", "Either 'up' or 'down'", "string"), body('', "If you're creating a 3rd-party task, pass up any task attributes in the body (see TaskSchema).", 'object')],
        method: 'POST'
      },
      action: user.score
    },
    "/user/tasks:GET": {
      spec: {
        path: '/user/tasks',
        description: "Get all user's tasks"
      },
      action: user.getTasks
    },
    "/user/tasks:POST": {
      spec: {
        path: '/user/tasks',
        description: "Create a task",
        method: 'POST',
        parameters: [body("", "Send up the whole task (see TaskSchema)", "object")]
      },
      action: user.addTask
    },
    "/user/tasks/{id}:GET": {
      spec: {
        path: '/user/tasks/{id}',
        description: "Get an individual task",
        parameters: [path("id", "Task ID", "string")]
      },
      action: user.getTask
    },
    "/user/tasks/{id}:PUT": {
      spec: {
        path: '/user/tasks/{id}',
        description: "Update a user's task",
        method: 'PUT',
        parameters: [path("id", "Task ID", "string"), body("", "Send up the whole task (see TaskSchema)", "object")]
      },
      action: user.updateTask
    },
    "/user/tasks/{id}:DELETE": {
      spec: {
        path: '/user/tasks/{id}',
        description: "Delete a task",
        method: 'DELETE',
        parameters: [path("id", "Task ID", "string")]
      },
      action: user.deleteTask
    },
    "/user/tasks/{id}/sort": {
      spec: {
        method: 'POST',
        description: 'Sort tasks',
        parameters: [path("id", "Task ID", "string"), query("from", "Index where you're sorting from (0-based)", "integer"), query("to", "Index where you're sorting to (0-based)", "integer")]
      },
      action: user.sortTask
    },
    "/user/tasks/clear-completed": {
      spec: {
        method: 'POST',
        description: "Clears competed To-Dos (needed periodically for performance)."
      },
      action: user.clearCompleted
    },
    "/user/tasks/{id}/unlink": {
      spec: {
        method: 'POST',
        description: 'Unlink a task from its challenge',
        parameters: [path("id", "Task ID", "string"), query('keep', "When unlinking a challenge task, how to handle the orphans?", 'string', ['keep', 'keep-all', 'remove', 'remove-all'])]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.unlink
    },
    "/user/inventory/buy": {
      spec: {
        description: "Get a list of buyable gear"
      },
      action: user.getBuyList
    },
    "/user/inventory/buy/{key}": {
      spec: {
        method: 'POST',
        description: "Buy a gear piece and equip it automatically",
        parameters: [path('key', "The key of the item to buy (call /content route for available keys)", 'string', _.keys(content.gear.flat))]
      },
      action: user.buy
    },
    "/user/inventory/sell/{type}/{key}": {
      spec: {
        method: 'POST',
        description: "Sell inventory items back to Alexander",
        parameters: [path('type', "The type of object you're selling back.", 'string', ['eggs', 'hatchingPotions', 'food']), path('key', "The object key you're selling back (call /content route for available keys)", 'string')]
      },
      action: user.sell
    },
    "/user/inventory/purchase/{type}/{key}": {
      spec: {
        method: 'POST',
        description: "Purchase a Gem-purchasable item from Alexander",
        parameters: [path('type', "The type of object you're purchasing.", 'string', ['eggs', 'hatchingPotions', 'food', 'quests', 'special']), path('key', "The object key you're purchasing (call /content route for available keys)", 'string')]
      },
      action: user.purchase
    },
    "/user/inventory/hourglass/{type}/{key}": {
      spec: {
        method: 'POST',
        description: "Purchase a pet or mount using a Mystic Hourglass",
        parameters: [path('type', "The type of object you're purchasing.", 'string', ['pets', 'mounts']), path('key', "The object key you're purchasing (call /content route for available keys)", 'string')]
      },
      action: user.hourglassPurchase
    },
    "/user/inventory/mystery/{key}": {
      spec: {
        method: 'POST',
        description: "Purchase a Mystery Item Set using a Mystic Hourglass",
        parameters: [path('key', "The key for the Mystery Set you're purchasing (call /content route for available keys)", 'string')]
      },
      action: user.buyMysterySet
    },
    "/user/inventory/feed/{pet}/{food}": {
      spec: {
        method: 'POST',
        description: "Feed your pet some food",
        parameters: [path('pet', "The key of the pet you're feeding", 'string', _.keys(content.pets)), path('food', "The key of the food to feed your pet", 'string', _.keys(content.food))]
      },
      action: user.feed
    },
    "/user/inventory/equip/{type}/{key}": {
      spec: {
        method: 'POST',
        description: "Equip an item (either pet, mount, equipped or costume)",
        parameters: [path('type', "Type to equip", 'string', ['pet', 'mount', 'equipped', 'costume']), path('key', "The object key you're equipping (call /content route for available keys)", 'string')]
      },
      action: user.equip
    },
    "/user/inventory/hatch/{egg}/{hatchingPotion}": {
      spec: {
        method: 'POST',
        description: "Pour a hatching potion on an egg",
        parameters: [path('egg', "The egg key to hatch", 'string', _.keys(content.eggs)), path('hatchingPotion', "The hatching potion to pour", 'string', _.keys(content.hatchingPotions))]
      },
      action: user.hatch
    },
    "/user:GET": {
      spec: {
        path: '/user',
        description: "Get the full user object"
      },
      action: user.getUser
    },
    "/user/anonymized": {
      spec: {
        description: "Get the user object without any personal data"
      },
      action: user.getUserAnonymized
    },
    "/user:PUT": {
      spec: {
        path: '/user',
        method: 'PUT',
        description: "Update the user object (only certain attributes are supported)",
        parameters: [body('', 'The user object (see UserSchema)', 'object')]
      },
      action: user.update
    },
    "/user:DELETE": {
      spec: {
        path: '/user',
        method: 'DELETE',
        description: "Delete a user object entirely, USE WITH CAUTION!"
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: user["delete"]
    },
    "/user/revive": {
      spec: {
        method: 'POST',
        description: "Revive your dead user"
      },
      action: user.revive
    },
    "/user/reroll": {
      spec: {
        method: 'POST',
        description: 'Drink the Fortify Potion (Note, it used to be called re-roll)'
      },
      action: user.reroll
    },
    "/user/reset": {
      spec: {
        method: 'POST',
        description: "Completely reset your account"
      },
      action: user.reset
    },
    "/user/sleep": {
      spec: {
        method: 'POST',
        description: "Toggle whether you're resting in the inn"
      },
      action: user.sleep
    },
    "/user/rebirth": {
      spec: {
        method: 'POST',
        description: "Rebirth your avatar"
      },
      action: user.rebirth
    },
    "/user/class/change": {
      spec: {
        method: 'POST',
        description: "Either remove your avatar's class, or change it to something new",
        parameters: [query('class', "The key of the class to change to. If not provided, user's class is removed.", 'string', ['warrior', 'healer', 'rogue', 'wizard', ''])]
      },
      action: user.changeClass
    },
    "/user/class/allocate": {
      spec: {
        method: 'POST',
        description: "Allocate one point towards an attribute",
        parameters: [query('stat', 'The stat to allocate towards', 'string', ['str', 'per', 'int', 'con'])]
      },
      action: user.allocate
    },
    "/user/class/cast/{spell}": {
      spec: {
        method: 'POST',
        description: "Casts a spell on a target.",
        parameters: [path('spell', "The key of the spell to cast (see ../../common#content/index.js)", 'string'), query('targetType', "The type of object you're targeting", 'string', ['party', 'self', 'user', 'task']), query('targetId', "The ID of the object you're targeting", 'string')]
      },
      action: user.cast
    },
    "/user/unlock": {
      spec: {
        method: 'POST',
        description: "Unlock a certain gem-purchaseable path (or multiple paths)",
        parameters: [query('path', "The path to unlock, such as hair.green or shirts.red,shirts.blue", 'string')]
      },
      action: user.unlock
    },
    "/user/batch-update": {
      spec: {
        method: 'POST',
        description: "This is an advanced route which is useful for apps which might for example need offline support. You can send a whole batch of user-based operations, which allows you to queue them up offline and send them all at once. The format is {op:'nameOfOperation',parameters:{},body:{},query:{}}",
        parameters: [body('', 'The array of batch-operations to perform', 'object')]
      },
      middleware: [forceRefresh, auth.auth, i18n.getUserLanguage, cron, user.sessionPartyInvite],
      action: user.batchUpdate
    },
    "/user/tags/{id}:GET": {
      spec: {
        path: '/user/tags/{id}',
        method: 'GET',
        description: "Get a tag",
        parameters: [path('id', 'The id of the tag to get', 'string')]
      },
      action: user.getTag
    },
    "/user/tags:POST": {
      spec: {
        path: "/user/tags",
        method: 'POST',
        description: 'Create a new tag',
        parameters: [body('', 'New tag (see UserSchema.tags)', 'object')]
      },
      action: user.addTag
    },
    "/user/tags:GET": {
      spec: {
        path: "/user/tags",
        method: 'GET',
        description: 'List all of a user\'s tags'
      },
      action: user.getTags
    },
    "/user/tags/sort": {
      spec: {
        method: 'POST',
        description: 'Sort tags',
        parameters: [query("from", "Index where you're sorting from (0-based)", "integer"), query("to", "Index where you're sorting to (0-based)", "integer")]
      },
      action: user.sortTag
    },
    "/user/tags/{id}:PUT": {
      spec: {
        path: '/user/tags/{id}',
        method: 'PUT',
        description: "Edit a tag",
        parameters: [path('id', 'The id of the tag to edit', 'string'), body('', 'Tag edits (see UserSchema.tags)', 'object')]
      },
      action: user.updateTag
    },
    "/user/tags/{id}:DELETE": {
      spec: {
        path: '/user/tags/{id}',
        method: 'DELETE',
        description: 'Delete a tag',
        parameters: [path('id', 'Id of tag to delete', 'string')]
      },
      action: user.deleteTag
    },
    "/user/webhooks": {
      spec: {
        method: 'POST',
        description: 'Create a new webhook',
        parameters: [body('', 'New Webhook {url:"webhook endpoint (required)", id:"id of webhook (shared.uuid(), optional)", enabled:"whether webhook is enabled (true by default, optional)"}', 'object')]
      },
      action: user.addWebhook
    },
    "/user/webhooks/{id}:PUT": {
      spec: {
        path: '/user/webhooks/{id}',
        method: 'PUT',
        description: "Edit a webhook",
        parameters: [path('id', 'The id of the webhook to edit', 'string'), body('', 'New Webhook {url:"webhook endpoint (required)", id:"id of webhook (shared.uuid(), optional)", enabled:"whether webhook is enabled (true by default, optional)"}', 'object')]
      },
      action: user.updateWebhook
    },
    "/user/webhooks/{id}:DELETE": {
      spec: {
        path: '/user/webhooks/{id}',
        method: 'DELETE',
        description: 'Delete a webhook',
        parameters: [path('id', 'Id of webhook to delete', 'string')]
      },
      action: user.deleteWebhook
    },
    "/user/pushDevice": {
      spec: {
        method: 'POST',
        description: 'Add a new push devices registration ID',
        parameters: [body('', 'New push registration { regId: "123123", type: "android"}', 'object')]
      },
      action: user.addPushDevice
    },
    "/groups:GET": {
      spec: {
        path: '/groups',
        description: "Get a list of groups",
        parameters: [query('type', "Comma-separated types of groups to return, eg 'party,guilds,public,tavern'", 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: groups.list
    },
    "/groups:POST": {
      spec: {
        path: '/groups',
        method: 'POST',
        description: 'Create a group',
        parameters: [body('', 'Group object (see GroupSchema)', 'object')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: groups.create
    },
    "/groups/{gid}:GET": {
      spec: {
        path: '/groups/{gid}',
        description: "Get a group. The party the user currently is in can be accessed with the gid 'party'.",
        parameters: [path('gid', 'Group ID', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: groups.get
    },
    "/groups/{gid}:POST": {
      spec: {
        path: '/groups/{gid}',
        method: 'POST',
        description: "Edit a group",
        parameters: [body('', 'Group object (see GroupSchema)', 'object')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.update
    },
    "/groups/{gid}/join": {
      spec: {
        method: 'POST',
        description: 'Join a group',
        parameters: [path('gid', 'Id of the group to join', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.join
    },
    "/groups/{gid}/leave": {
      spec: {
        method: 'POST',
        description: 'Leave a group',
        parameters: [path('gid', 'ID of the group to leave', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.leave
    },
    "/groups/{gid}/invite": {
      spec: {
        method: 'POST',
        description: "Invite a user to a group",
        parameters: [path('gid', 'Group id', 'string'), body('', 'a payload of invites either under body.uuids or body.emails, only one of them!', 'object')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.invite
    },
    "/groups/{gid}/removeMember": {
      spec: {
        method: 'POST',
        description: "Remove / boot a member from a group",
        parameters: [path('gid', 'Group id', 'string'), query('uuid', 'User id to boot', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.removeMember
    },
    "/groups/{gid}/questAccept": {
      spec: {
        method: 'POST',
        description: "Accept a quest invitation",
        parameters: [path('gid', "Group id", 'string'), query('key', "optional. if provided, trigger new invite, if not, accept existing invite", 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.questAccept
    },
    "/groups/{gid}/questReject": {
      spec: {
        method: 'POST',
        description: 'Reject quest invitation',
        parameters: [path('gid', 'Group id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.questReject
    },
    "/groups/{gid}/questCancel": {
      spec: {
        method: 'POST',
        description: 'Cancel quest before it starts (in invitation stage)',
        parameters: [path('gid', 'Group to cancel quest in', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.questCancel
    },
    "/groups/{gid}/questAbort": {
      spec: {
        method: 'POST',
        description: 'Abort quest after it has started (all progress will be lost)',
        parameters: [path('gid', 'Group to abort quest in', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.questAbort
    },
    "/groups/{gid}/questLeave": {
      spec: {
        method: 'POST',
        description: 'Leave an active quest (Quest leaders cannot leave active quests. They must abort the quest to leave)',
        parameters: [path('gid', 'Group to leave quest in', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.questLeave
    },
    "/groups/{gid}/chat:GET": {
      spec: {
        path: "/groups/{gid}/chat",
        description: "Get all chat messages",
        parameters: [path('gid', 'Group to return the chat from ', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.getChat
    },
    "/groups/{gid}/chat:POST": {
      spec: {
        method: 'POST',
        path: "/groups/{gid}/chat",
        description: "Send a chat message",
        parameters: [query('message', 'Chat message', 'string'), path('gid', 'Group id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.postChat
    },
    "/groups/{gid}/chat/seen": {
      spec: {
        method: 'POST',
        description: "Flag chat messages for a particular group as seen",
        parameters: [path('gid', 'Group id', 'string')]
      },
      action: groups.seenMessage
    },
    "/groups/{gid}/chat/{messageId}": {
      spec: {
        method: 'DELETE',
        description: 'Delete a chat message in a given group',
        parameters: [path('gid', 'ID of the group containing the message to be deleted', 'string'), path('messageId', 'ID of message to be deleted', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.deleteChatMessage
    },
    "/groups/{gid}/chat/{mid}/like": {
      spec: {
        method: 'POST',
        description: "Like a chat message",
        parameters: [path('gid', 'Group id', 'string'), path('mid', 'Message id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.likeChatMessage
    },
    "/groups/{gid}/chat/{mid}/flag": {
      spec: {
        method: 'POST',
        description: "Flag a chat message",
        parameters: [path('gid', 'Group id', 'string'), path('mid', 'Message id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.flagChatMessage
    },
    "/groups/{gid}/chat/{mid}/clearflags": {
      spec: {
        method: 'POST',
        description: "Clear flag count from message and unhide it",
        parameters: [path('gid', 'Group id', 'string'), path('mid', 'Message id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage, groups.attachGroup],
      action: groups.clearFlagCount
    },
    "/members/{uuid}:GET": {
      spec: {
        path: '/members/{uuid}',
        description: "Get a member.",
        parameters: [path('uuid', 'Member ID', 'string')]
      },
      middleware: [i18n.getUserLanguage],
      action: members.getMember
    },
    "/members/{uuid}/message": {
      spec: {
        method: 'POST',
        description: 'Send a private message to a member',
        parameters: [path('uuid', 'The UUID of the member to message', 'string'), body('', '{"message": "The private message to send"}', 'object')]
      },
      middleware: [auth.auth],
      action: members.sendPrivateMessage
    },
    "/members/{uuid}/block": {
      spec: {
        method: 'POST',
        description: 'Block a member from sending private messages',
        parameters: [path('uuid', 'The UUID of the member to message', 'string')]
      },
      middleware: [auth.auth],
      action: user.blockUser
    },
    "/members/{uuid}/gift": {
      spec: {
        method: 'POST',
        description: 'Send a gift to a member',
        parameters: [path('uuid', 'The UUID of the member', 'string'), body('', '{"type": "gems or subscription", "gems":{"amount":Number, "fromBalance":Boolean}, "subscription":{"months":Number}}', 'object')]
      },
      middleware: [auth.auth],
      action: members.sendGift
    },
    "/hall/heroes": {
      spec: {},
      middleware: [auth.auth, i18n.getUserLanguage],
      action: hall.getHeroes
    },
    "/hall/heroes/{uid}:GET": {
      spec: {
        path: "/hall/heroes/{uid}"
      },
      middleware: [auth.auth, i18n.getUserLanguage, hall.ensureAdmin],
      action: hall.getHero
    },
    "/hall/heroes/{uid}:POST": {
      spec: {
        method: 'POST',
        path: "/hall/heroes/{uid}"
      },
      middleware: [auth.auth, i18n.getUserLanguage, hall.ensureAdmin],
      action: hall.updateHero
    },
    "/hall/patrons": {
      spec: {
        parameters: [query('page', 'Page number to fetch (this list is long)', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: hall.getPatrons
    },
    "/challenges:GET": {
      spec: {
        path: '/challenges',
        description: "Get a list of challenges"
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.list
    },
    "/challenges:POST": {
      spec: {
        path: '/challenges',
        method: 'POST',
        description: "Create a challenge",
        parameters: [body('', 'Challenge object (see ChallengeSchema)', 'object')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.create
    },
    "/challenges/{cid}:GET": {
      spec: {
        path: '/challenges/{cid}',
        description: 'Get a challenge',
        parameters: [path('cid', 'Challenge id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.get
    },
    "/challenges/{cid}/csv": {
      spec: {
        description: 'Get a challenge (csv format)',
        parameters: [path('cid', 'Challenge id', 'string')]
      },
      action: challenges.csv
    },
    "/challenges/{cid}:POST": {
      spec: {
        path: '/challenges/{cid}',
        method: 'POST',
        description: "Update a challenge",
        parameters: [path('cid', 'Challenge id', 'string'), body('', 'Challenge object (see ChallengeSchema)', 'object')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.update
    },
    "/challenges/{cid}:DELETE": {
      spec: {
        path: '/challenges/{cid}',
        method: 'DELETE',
        description: "Delete a challenge",
        parameters: [path('cid', 'Challenge id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges["delete"]
    },
    "/challenges/{cid}/close": {
      spec: {
        method: 'POST',
        description: 'Close a challenge',
        parameters: [path('cid', 'Challenge id', 'string'), query('uid', 'User ID of the winner', 'string', true)]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.selectWinner
    },
    "/challenges/{cid}/join": {
      spec: {
        method: 'POST',
        description: "Join a challenge",
        parameters: [path('cid', 'Challenge id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.join
    },
    "/challenges/{cid}/leave": {
      spec: {
        method: 'POST',
        description: 'Leave a challenge',
        parameters: [path('cid', 'Challenge id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.leave
    },
    "/challenges/{cid}/member/{uid}": {
      spec: {
        description: "Get a member's progress in a particular challenge",
        parameters: [path('cid', 'Challenge id', 'string'), path('uid', 'User id', 'string')]
      },
      middleware: [auth.auth, i18n.getUserLanguage],
      action: challenges.getMember
    }
  };
  if (nconf.get("NODE_ENV") === "development") {
    api["/user/addTenGems"] = {
      spec: {
        method: 'POST'
      },
      action: user.addTenGems
    };
    api["/user/addHourglass"] = {
      spec: {
        method: 'POST'
      },
      action: user.addHourglass
    };
  };

  _.each(api, function(route, path) {
    var base;
    if ((base = route.spec).description == null) {
      base.description = '';
    }
    _.defaults(route.spec, {
      path: path,
      nickname: path,
      notes: route.spec.description,
      summary: route.spec.description,
      parameters: [],
      errorResponses: [],
      method: 'GET'
    });
    if (route.middleware == null) {
      route.middleware = path.indexOf('/user') === 0 ? [auth.auth, i18n.getUserLanguage, cron] : [i18n.getUserLanguage];
    }
    swagger["add" + route.spec.method](route);
    return true;
  });

  return swagger.configure((nconf.get('BASE_URL')) + "/api/v2", "2");
};
