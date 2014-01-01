# see https://github.com/wordnik/swagger-node-express

_ = require('lodash')
nconf = require('nconf')
content = require('habitrpg-shared').content

module.exports = (swagger) ->
  [path,body,query] = [swagger.pathParam, swagger.bodyParam, swagger.queryParam]

  swagger.configureSwaggerPaths("", "/api-docs", "")

  api =
    "/content":
      description: "Get all available content objects. This is essential, since Habit often depends on item keys (eg, when purchasing a weapon)."
      method: 'GET'

    "/export/history":
      description: "Export user history"
      method: 'GET'

    # ---------------------------------
    # User
    # ---------------------------------

    # Scoring

    "/user/tasks/{id}/{direction}":
      description: "Simple scoring of a task"
      params: [
        path("id", "ID of the task to score. If this task doesn't exist, a task will be created automatically", "string")
        path("direction", "Either 'up' or 'down'", "string")
      ]
      method: 'POST'

    # Tasks
    "/user/tasks":
      description: "Get all user's tasks"

    "/user/tasks/{id}":
      description: "Get an individual task"
      params: [
        path("id", "Task ID", "string")
      ]

    "/user/tasks/{id}":
      description: "Update a user's task"
      method: 'PUT'
      params: [
        path("id", "Task ID", "string")
        body("","Send up the whole task","object")
      ]

    "/user/tasks/{id}":
      description: "Delete a task"
      method: 'DELETE'
      params: [ path("id", "Task ID", "string") ]

    "/user/tasks":
      description: "Create a task"
      method: 'POST'
      params: [ body("","Send up the whole task","object") ]

    "/user/tasks/{id}/sort":
      method: 'POST'
      description: 'Sort tasks'
      params: [
        path("id", "Task ID", "string")
        query("from","Index where you're sorting from (0-based)","integer")
        query("to","Index where you're sorting to (0-based)","integer")
      ]

    "/user/tasks/clear-completed":
      method: 'POST'
      description: "Clears competed To-Dos (needed periodically for performance."

    "/user/tasks/{id}/unlink":
      method: 'POST'
      description: 'Unlink a task from its challenge'
      # TODO query params?
      params: [path("id", "Task ID", "string")]


    # Inventory
    "/user/inventory/buy/{key}":
      method: 'POST'
      description: "Buy a gear piece and equip it automatically"
      params:[
        path 'key',"The key of the item to buy (call /content route for available keys)",'string', _.keys(content.gear.flat)
        #TODO embed keys
      ]

    "/user/inventory/sell/{type}/{key}":
      method: 'POST'
      description: "Sell inventory items back to Alexander"
      params: [
        #TODO verify these are the correct types
        path('type',"The type of object you're selling back.",'string',['gear','eggs','hatchingPotions','food'])
        path('key',"The object key you're selling back (call /content route for available keys)",'string')
      ]

    "/user/inventory/purchase/{type}/{key}":
      method: 'POST'
      description: "Purchase a gem-purchaseable item from Alexander"
      params:[
        path('type',"The type of object you're purchasing.",'string',['gear','eggs','hatchingPotions','food'])
        path('key',"The object key you're purchasing (call /content route for available keys)",'string')
      ]

    "/user/inventory/feed/{pet}/{food}":
      method: 'POST'
      description: "Feed your pet some food"
      params: [
        path 'pet',"The key of the pet you're feeding",'string'#,_.keys(content.pets))
        path 'food',"The key of the food to feed your pet",'string',_.keys(content.food)
      ]

    "/user/inventory/equip/{type}/{key}":
      method: 'POST'
      description: "Equip an item (either pets, mounts, or gear)"
      params: [
        path 'type',"Type to equip",'string',['pets','mounts','gear']
        path 'key',"The object key you're equipping (call /content route for available keys)",'string'
      ]

    "/user/inventory/hatch/{egg}/{hatchingPotion}":
      method: 'POST'
      description: "Pour a hatching potion on an egg"
      params: [
        path 'egg',"The egg key to hatch",'string',_.keys(content.eggs)
        path 'hatchingPotion',"The hatching potion to pour",'string',_.keys(content.hatchingPotions)
      ]

    # User
    "/user:GET":
      path: '/user'
      description: "Get the full user object"

    "/user:PUT":
      path: '/user'
      method: 'PUT'
      description: "Update the user object (only certain attributes are supported)"
      params: [
        body '','The user object','object'
      ]

    "/user:DELETE":
      path: '/user'
      method: 'DELETE'
      description: "Delete a user object entirely, USE WITH CAUTION!"

    "/user/revive":
      method: 'POST'
      description: "Revive your dead user"

    "/user/reroll":
      method: 'POST'
      description: 'Drink the Fortify Potion (Note, it used to be called re-roll)'

    "/user/reset":
      method: 'POST'
      description: "Completely reset your account"

    "/user/sleep":
      method: 'POST'
      description: "Toggle whether you're resting in the inn"

    "/user/rebirth":
      method: 'POST'
      description: "Rebirth your avatar"

    "/user/class/change":
      method: 'POST'
      description: "Either remove your avatar's class, or change it to something new"
      params: [
        query 'class',"The key of the class to change to. If not provided, user's class is removed.",'string',['warrior','healer','rogue','wizard','']
      ]

    "/user/class/allocate":
      method: 'POST'
      description: "Allocate one point towards an attribute"
      params: [
        query 'stat','The stat to allocate towards','string'
      ]

    "/user/class/cast/{spell}":
      method: 'POST'
      description: "Cast a spell"
      #TODO finish

    "/user/unlock":
      method: 'POST'
      description: "Unlock a certain gem-purchaseable path (or multiple paths)"
      params: [
        query 'path',"The path to unlock, such as hair.green or shirts.red,shirts.blue",'string'
      ]

    "/user/batch-update":
      method: 'POST'
      description: "This is an advanced route which is useful for apps which might for example need offline support. You can send a whole batch of user-based operations, which allows you to queue them up offline and send them all at once. The format is {op:'nameOfOperation',params:{},body:{},query:{}}"
      params:[
        body '','The array of batch-operations to perform','object'
      ]

    # Tags
    "/user/tags":
      method: 'POST'
      description: 'Create a new tag'
      params: [
        #TODO document
        body '','New tag','object'
      ]

    "/user/tags/{id}:PUT":
      path: 'user/tags/{id}'
      method: 'PUT'
      description: "Edit a tag"
      params: [
        path 'id','The id of the tag to edit','string'
        body '','Tag edits','object'
      ]

    "/user/tags/{id}:DELETE":
      path: 'user/tags/{id}'
      method: 'DELETE'
      description: 'Delete a tag'
      params: [
        path 'id','Id of tag to delete','string'
      ]


    # ---------------------------------
    # Groups
    # ---------------------------------
    "/groups:GET":
      path: '/groups'
    "/groups:POST":
      path: '/groups'
      method: 'POST'
    "/groups/{gid}:GET":
      path: '/groups/{gid}'
    "/groups/{gid}:POST":
      path: '/groups/{gid}'
      method: 'POST'
    "/groups/{gid}":
      path: '/groups/{gid}'
      method: 'PUT'

    "/groups/{gid}/join":
      method: 'POST'
    "/groups/{gid}/leave":
      method: 'POST'
    "/groups/{gid}/invite":
      method: 'POST'
    "/groups/{gid}/removeMember":
      method: 'POST'
    "/groups/{gid}/questAccept":
      method: 'POST'
      # query={key} (optional. if provided, trigger new invite, if not, accept existing invite)
    "/groups/{gid}/questReject":
      method: 'POST'
    "/groups/{gid}/questAbort":
      method: 'POST'

    #GET  /groups/:gid/chat
    "/groups/{gid}/chat":
      method: 'POST'
    "/groups/{gid}/chat/{messageId}":
      method: 'DELETE'


    # ---------------------------------
    # Members
    # ---------------------------------
    "/members/{uid}":{}

    # ---------------------------------
    # Challenges
    # ---------------------------------

    # Note: while challenges belong to groups, and would therefore make sense as a nested resource
    # (eg /groups/:gid/challenges/:cid), they will also be referenced by users from the "challenges" tab
    # without knowing which group they belong to. So to prevent unecessary lookups, we have them as a top-level resource
    "/challenges:GET":
      path: '/challenges'
    "/challenges:POST":
      path: '/challenges'
      method: 'POST'
    "/challenges/{cid}:GET": {}
    "/challenges/{cid}:POST":
      path: '/challenges/{cid}'
      method: 'POST'
    "/challenges/{cid}:DELETE":
      path: '/challenges/{cid}'
      method: 'DELETE'
    "/challenges/{cid}/close":
      method: 'POST'
    "/challenges/{cid}/join":
      method: 'POST'
    "/challenges/{cid}/leave":
      method: 'POST'
    "/challenges/{cid}/member/{uid}":{}

  _.each api, (spec, path) ->
    ## Spec format is:
    #    spec:
    #      path: "/pet/{petId}"
    #      description: "Operations about pets"
    #      notes: "Returns a pet based on ID"
    #      summary: "Find pet by ID"
    #      method: "GET"
    #      params: [path("petId", "ID of pet that needs to be fetched", "string")]
    #      type: "Pet"
    #      errorResponses: [swagger.errors.invalid("id"), swagger.errors.notFound("pet")]
    #      nickname: "getPetById"

    spec.description ?= ''
    _.defaults spec,
      path: path
      nickname: path
      notes: spec.description
      summary: spec.description
      params: []
      #type: 'Pet'
      errorResponses: []
      method: 'GET'
    route = {spec}
    swagger["add#{route.spec.method}"](route);true

  swagger.configure(nconf.get('BASE_URL'), "0.1")