###
---------- /api/v2 API ------------
see https://github.com/wordnik/swagger-node-express
Every url added to router is prefaced by /api/v2
Note: Many user-route ops exist in habitrpg-shard/script/index.coffee#user.ops, so that they can (1) be called both
client and server.
v1 user. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
$ mocha test/user.mocha.coffee
###

user = require("../controllers/user")
groups = require("../controllers/groups")
auth = require("../controllers/auth")
hall = require("../controllers/hall")
challenges = require("../controllers/challenges")
dataexport = require("../controllers/dataexport")
nconf = require("nconf")
middleware = require("../middleware")
cron = user.cron
_ = require('lodash')
content = require('habitrpg-shared').content


module.exports = (swagger, v2) ->
  [path,body,query] = [swagger.pathParam, swagger.bodyParam, swagger.queryParam]

  swagger.setAppHandler(v2)
  swagger.setErrorHandler("next")
  swagger.setHeaders = -> #disable setHeaders, since we have our own thing going on in middleware.js (and which requires `req`, which swagger doesn't pass in)
  swagger.configureSwaggerPaths("", "/api-docs", "")

  api =

    '/status':
      spec:
        description: "Returns the status of the server (up or down)"
      action: (req, res) ->
        res.json status: "up"

    '/content':
      spec:
        description: "Get all available content objects. This is essential, since Habit often depends on item keys (eg, when purchasing a weapon)."
      action: user.getContent


    "/export/history":
      spec:
        description: "Export user history"
        method: 'GET'
      middleware: auth.auth
      action: dataexport.history #[todo] encode data output options in the data controller and use these to build routes

    # ---------------------------------
    # User
    # ---------------------------------

    # Scoring

    "/user/tasks/{id}/{direction}":
      spec:
        #notes: "Simple scoring of a task."
        description: "Simple scoring of a task. This is most-likely the only API route you'll be using as a 3rd-party developer. The most common operation is for the user to gain or lose points based on some action (browsing Reddit, running a mile, 1 Pomodor, etc). Call this route, if the task you're trying to score doesn't exist, it will be created for you."
        parameters: [
          path("id", "ID of the task to score. If this task doesn't exist, a task will be created automatically", "string")
          path("direction", "Either 'up' or 'down'", "string")
          body '',"If you're creating a 3rd-party task, pass up any task attributes in the body (see TaskSchema).",'object'
        ]
        method: 'POST'
      action: user.score

    # Tasks
    "/user/tasks:GET":
      spec:
        path: '/user/tasks'
        description: "Get all user's tasks"
      action: user.getTasks

    "/user/tasks:POST":
      spec:
        path: '/user/tasks'
        description: "Create a task"
        method: 'POST'
        parameters: [ body "","Send up the whole task (see TaskSchema)","object" ]
      action: user.addTask

    "/user/tasks/{id}:GET":
      spec:
        path: '/user/tasks/{id}'
        description: "Get an individual task"
        parameters: [
          path("id", "Task ID", "string")
        ]
      action: user.getTask

    "/user/tasks/{id}:PUT":
      spec:
        path: '/user/tasks/{id}'
        description: "Update a user's task"
        method: 'PUT'
        parameters: [
          path "id", "Task ID", "string"
          body "","Send up the whole task (see TaskSchema)","object"
        ]
      action: user.updateTask

    "/user/tasks/{id}:DELETE":
      spec:
        path: '/user/tasks/{id}'
        description: "Delete a task"
        method: 'DELETE'
        parameters: [ path("id", "Task ID", "string") ]
      action: user.deleteTask


    "/user/tasks/{id}/sort":
      spec:
        method: 'POST'
        description: 'Sort tasks'
        parameters: [
          path("id", "Task ID", "string")
          query("from","Index where you're sorting from (0-based)","integer")
          query("to","Index where you're sorting to (0-based)","integer")
        ]
      action: user.sortTask

    "/user/tasks/clear-completed":
      spec:
        method: 'POST'
        description: "Clears competed To-Dos (needed periodically for performance)."
      action: user.clearCompleted


    "/user/tasks/{id}/unlink":
      spec:
        method: 'POST'
        description: 'Unlink a task from its challenge'
        parameters: [
          path("id", "Task ID", "string")
          query 'keep',"When unlinking a challenge task, how to handle the orphans?",'string',['keep','keep-all','remove','remove-all']
        ]
      middleware: auth.auth ## removing cron since they may want to remove task first
      action: challenges.unlink


    # Inventory
    "/user/inventory/buy/{key}":
      spec:
        method: 'POST'
        description: "Buy a gear piece and equip it automatically"
        parameters:[
          path 'key',"The key of the item to buy (call /content route for available keys)",'string', _.keys(content.gear.flat)
        ]
      action: user.buy

    "/user/inventory/sell/{type}/{key}":
      spec:
        method: 'POST'
        description: "Sell inventory items back to Alexander"
        parameters: [
          #TODO verify these are the correct types
          path('type',"The type of object you're selling back.",'string',['gear','eggs','hatchingPotions','food'])
          path('key',"The object key you're selling back (call /content route for available keys)",'string')
        ]
      action: user.sell

    "/user/inventory/purchase/{type}/{key}":
      spec:
        method: 'POST'
        description: "Purchase a gem-purchaseable item from Alexander"
        parameters:[
          path('type',"The type of object you're purchasing.",'string',['gear','eggs','hatchingPotions','food'])
          path('key',"The object key you're purchasing (call /content route for available keys)",'string')
        ]
      action: user.purchase


    "/user/inventory/feed/{pet}/{food}":
      spec:
        method: 'POST'
        description: "Feed your pet some food"
        parameters: [
          path 'pet',"The key of the pet you're feeding",'string',_.keys(content.pets)
          path 'food',"The key of the food to feed your pet",'string',_.keys(content.food)
        ]
      action: user.feed

    "/user/inventory/equip/{type}/{key}":
      spec:
        method: 'POST'
        description: "Equip an item (either pets, mounts, or gear)"
        parameters: [
          path 'type',"Type to equip",'string',['pets','mounts','gear']
          path 'key',"The object key you're equipping (call /content route for available keys)",'string'
        ]
      action: user.equip

    "/user/inventory/hatch/{egg}/{hatchingPotion}":
      spec:
        method: 'POST'
        description: "Pour a hatching potion on an egg"
        parameters: [
          path 'egg',"The egg key to hatch",'string',_.keys(content.eggs)
          path 'hatchingPotion',"The hatching potion to pour",'string',_.keys(content.hatchingPotions)
        ]
      action: user.hatch


    # User
    "/user:GET":
      spec:
        path: '/user'
        description: "Get the full user object"
      action: user.getUser

    "/user:PUT":
      spec:
        path: '/user'
        method: 'PUT'
        description: "Update the user object (only certain attributes are supported)"
        parameters: [
          body '','The user object (see UserSchema)','object'
        ]
      action: user.update

    "/user:DELETE":
      spec:
        path: '/user'
        method: 'DELETE'
        description: "Delete a user object entirely, USE WITH CAUTION!"
      middleware: auth.auth
      action: user["delete"]

    "/user/revive":
      spec:
        method: 'POST'
        description: "Revive your dead user"
      action: user.revive

    "/user/reroll":
      spec:
        method: 'POST'
        description: 'Drink the Fortify Potion (Note, it used to be called re-roll)'
      action: user.reroll

    "/user/reset":
      spec:
        method: 'POST'
        description: "Completely reset your account"
      action: user.reset

    "/user/sleep":
      spec:
        method: 'POST'
        description: "Toggle whether you're resting in the inn"
      action: user.sleep

    "/user/rebirth":
      spec:
        method: 'POST'
        description: "Rebirth your avatar"
      action: user.rebirth

    "/user/class/change":
      spec:
        method: 'POST'
        description: "Either remove your avatar's class, or change it to something new"
        parameters: [
          query 'class',"The key of the class to change to. If not provided, user's class is removed.",'string',['warrior','healer','rogue','wizard','']
        ]
      action: user.changeClass

    "/user/class/allocate":
      spec:
        method: 'POST'
        description: "Allocate one point towards an attribute"
        parameters: [
          query 'stat','The stat to allocate towards','string',['str','per','int','con']
        ]
      action:user.allocate

    "/user/class/cast/{spell}":
      spec:
        method: 'POST'
        description: "Casts a spell on a target."
        parameters: [
          path 'spell',"The key of the spell to cast (see habitrpg-shared#content.coffee)",'string'
          query 'targetType',"The type of object you're targeting",'string',['party','self','user','task']
          query 'targetId',"The ID of the object you're targeting",'string'

        ]
      action: user.cast

    "/user/unlock":
      spec:
        method: 'POST'
        description: "Unlock a certain gem-purchaseable path (or multiple paths)"
        parameters: [
          query 'path',"The path to unlock, such as hair.green or shirts.red,shirts.blue",'string'
        ]
      action: user.unlock

    "/user/batch-update":
      spec:
        method: 'POST'
        description: "This is an advanced route which is useful for apps which might for example need offline support. You can send a whole batch of user-based operations, which allows you to queue them up offline and send them all at once. The format is {op:'nameOfOperation',parameters:{},body:{},query:{}}"
        parameters:[
          body '','The array of batch-operations to perform','object'
        ]
      middleware: [middleware.forceRefresh, auth.auth, cron]
      action: user.batchUpdate

    # Tags
    "/user/tags":
      spec:
        method: 'POST'
        description: 'Create a new tag'
        parameters: [
          body '','New tag (see UserSchema.tags)','object'
        ]
      action: user.addTag

    "/user/tags/{id}:PUT":
      spec:
        path: '/user/tags/{id}'
        method: 'PUT'
        description: "Edit a tag"
        parameters: [
          path 'id','The id of the tag to edit','string'
          body '','Tag edits (see UserSchema.tags)','object'
        ]
      action: user.updateTag

    "/user/tags/{id}:DELETE":
      spec:
        path: '/user/tags/{id}'
        method: 'DELETE'
        description: 'Delete a tag'
        parameters: [
          path 'id','Id of tag to delete','string'
        ]
      action: user.deleteTag

    # ---------------------------------
    # Groups
    # ---------------------------------
    "/groups:GET":
      spec:
        path: '/groups'
        description: "Get a list of groups. The *guilds* type lets you retrieve data about all the guilds you are subscribed to."
        parameters: [
          query 'type',"Comma-separated types of groups to return, eg 'party,guilds,public,tavern'",'string'
        ]
      middleware: auth.auth
      action: groups.list


    "/groups:POST":
      spec:
        path: '/groups'
        method: 'POST'
        description: 'Create a group'
        parameters: [
          body '','Group object (see GroupSchema)','object'
        ]
      middleware: auth.auth
      action: groups.create

    "/groups/{gid}:GET":
      spec:
        path: '/groups/{gid}'
        description: "Get a group"
        parameters: [path('gid','Group ID','string')]
      middleware: auth.auth
      action: groups.get

    "/groups/{gid}:POST":
      spec:
        path: '/groups/{gid}'
        method: 'POST'
        description: "Edit a group"
        parameters: [body('','Group object (see GroupSchema)','object')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.update

    "/groups/{gid}/join":
      spec:
        method: 'POST'
        description: 'Join a group'
        parameters: [path('gid','Id of the group to join','string')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.join

    "/groups/{gid}/leave":
      spec:
        method: 'POST'
        description: 'Leave a group'
        parameters: [path('gid','ID of the group to leave','string')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.leave

    "/groups/{gid}/invite":
      spec:
        method: 'POST'
        description: "Invite a user to a group"
        parameters: [
          path 'gid','Group id','string'
          query 'uuid','User id to invite','string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action:groups.invite

    "/groups/{gid}/removeMember":
      spec:
        method: 'POST'
        description: "Remove / boot a member from a group"
        parameters: [
          path 'gid','Group id','string'
          query 'uuid','User id to boot','string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action:groups.removeMember

    "/groups/{gid}/questAccept":
      spec:
        method: 'POST'
        description: "Accept a quest invitation"
        parameters: [
          path 'gid',"Group id",'string'
          query 'key',"optional. if provided, trigger new invite, if not, accept existing invite",'string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action:groups.questAccept

    "/groups/{gid}/questReject":
      spec:
        method: 'POST'
        description: 'Reject quest invitation'
        parameters: [
          path 'gid','Group id','string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.questReject

    "/groups/{gid}/questAbort":
      spec:
        method: 'POST'
        description: 'Abort quest'
        parameters: [path('gid','Group to abort quest in','string')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.questAbort

    #TODO PUT  /groups/:gid/chat/:messageId

    "/groups/{gid}/chat:GET":
      spec:
        path: "/groups/{gid}/chat"
        description: "Get all chat messages"
        parameters: [path('gid','Group to return the chat from ','string')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.getChat


    "/groups/{gid}/chat:POST":
      spec:
        method: 'POST'
        path: "/groups/{gid}/chat"
        description: "Send a chat message"
        parameters: [
          query 'message', 'Chat message','string'
          path 'gid','Group id','string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.postChat

    # placing before route below, so that if !=='seen' it goes to next()
    "/groups/{gid}/chat/seen":
      spec:
        method: 'POST'
        description: "Flag chat messages for a particular group as seen"
        parameters: [
          path 'gid','Group id','string'
        ]
      middleware: []
      action: groups.seenMessage

    "/groups/{gid}/chat/{messageId}":
      spec:
        method: 'DELETE'
        description: 'Delete a group'
        parameters: [path('gid','ID of group to delete','string')]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.deleteChatMessage

    "/groups/{gid}/chat/{mid}/like":
      spec:
        method: 'POST'
        description: "Like a chat message"
        parameters: [
          path 'gid','Group id','string'
          path 'mid','Message id','string'
        ]
      middleware: [auth.auth, groups.attachGroup]
      action: groups.likeChatMessage

    # ---------------------------------
    # Members
    # ---------------------------------
    "/members/{uid}":
      spec:{}
      action: groups.getMember

    # ---------------------------------
    # Hall of Heroes / Patrons
    # ---------------------------------
    "/hall/heroes":
      spec: {}
      middleware:[auth.auth]
      action: hall.getHeroes

    "/hall/heroes/{uid}:GET":
      spec: path: "/hall/heroes/{uid}"
      middleware:[auth.auth, hall.ensureAdmin]
      action: hall.getHero

    "/hall/heroes/{uid}:POST":
      spec:
        method: 'POST'
        path: "/hall/heroes/{uid}"
      middleware: [auth.auth, hall.ensureAdmin]
      action: hall.updateHero

    "/hall/patrons":
      spec:
        parameters: [
          query 'page','Page number to fetch (this list is long)','string'
        ]
      middleware:[auth.auth]
      action: hall.getPatrons


    # ---------------------------------
    # Challenges
    # ---------------------------------

    # Note: while challenges belong to groups, and would therefore make sense as a nested resource
    # (eg /groups/:gid/challenges/:cid), they will also be referenced by users from the "challenges" tab
    # without knowing which group they belong to. So to prevent unecessary lookups, we have them as a top-level resource
    "/challenges:GET":
      spec:
        path: '/challenges'
        description: "Get a list of the challenges created by the guilds you are subscribed to, including Tavern challenges"
      middleware: [auth.auth]
      action: challenges.list


    "/challenges:POST":
      spec:
        path: '/challenges'
        method: 'POST'
        description: "Create a challenge"
        parameters: [body('','Challenge object (see ChallengeSchema)','object')]
      middleware: [auth.auth]
      action: challenges.create

    "/challenges/{cid}:GET":
      spec:
        path: '/challenges/{cid}'
        description: 'Get a challenge'
        parameters: [path('cid','Challenge id','string')]
      action: challenges.get

    "/challenges/{cid}/csv":
      spec:
        description: 'Get a challenge (csv format)'
        parameters: [path('cid','Challenge id','string')]
      action: challenges.csv

    "/challenges/{cid}:POST":
      spec:
        path: '/challenges/{cid}'
        method: 'POST'
        description: "Update a challenge"
        parameters: [
          path 'cid','Challenge id','string'
          body('','Challenge object (see ChallengeSchema)','object')
        ]
      middleware: [auth.auth]
      action: challenges.update

    "/challenges/{cid}:DELETE":
      spec:
        path: '/challenges/{cid}'
        method: 'DELETE'
        description: "Delete a challenge"
        parameters: [path('cid','Challenge id','string')]
      middleware: [auth.auth]
      action: challenges["delete"]

    "/challenges/{cid}/close":
      spec:
        method: 'POST'
        description: 'Close a challenge'
        parameters: [
          path 'cid','Challenge id','string'
          query 'uid','User ID of the winner','string',true
        ]
      middleware: [auth.auth]
      action: challenges.selectWinner

    "/challenges/{cid}/join":
      spec:
        method: 'POST'
        description: "Join a challenge"
        parameters: [path('cid','Challenge id','string')]
      middleware: [auth.auth]
      action: challenges.join

    "/challenges/{cid}/leave":
      spec:
        method: 'POST'
        description: 'Leave a challenge'
        parameters: [path('cid','Challenge id','string')]
      middleware: [auth.auth]
      action: challenges.leave

    "/challenges/{cid}/member/{uid}":
      spec:
        description: "Get a member's progress in a particular challenge"
        parameters: [
          path 'cid','Challenge id','string'
          path 'uid','User id','string'
        ]
      middleware: [auth.auth]
      action: challenges.getMember


  if nconf.get("NODE_ENV") is "development"
    api["/user/addTenGems"] =
      spec: method:'POST'
      action: user.addTenGems

  _.each api, (route, path) ->
    ## Spec format is:
    #    spec:
    #      path: "/pet/{petId}"
    #      description: "Operations about pets"
    #      notes: "Returns a pet based on ID"
    #      summary: "Find pet by ID"
    #      method: "GET"
    #      parameters: [path("petId", "ID of pet that needs to be fetched", "string")]
    #      type: "Pet"
    #      errorResponses: [swagger.errors.invalid("id"), swagger.errors.notFound("pet")]
    #      nickname: "getPetById"

    route.spec.description ?= ''
    _.defaults route.spec,
      path: path
      nickname: path
      notes: route.spec.description
      summary: route.spec.description
      parameters: []
      #type: 'Pet'
      errorResponses: []
      method: 'GET'
    route.middleware ?= if path.indexOf('/user') is 0 then [auth.auth, cron] else []
    swagger["add#{route.spec.method}"](route);true


  swagger.configure("#{nconf.get('BASE_URL')}/api/v2", "2")
