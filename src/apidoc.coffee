# see https://github.com/wordnik/swagger-node-express

_ = require('lodash')

module.exports = (swagger) ->

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
        swagger.pathParam("id", "ID of the task to score. If this task doesn't exist, a task will be created automatically", "string")
        swagger.pathParam("direction", "Either 'up' or 'down'", "string")
      ]
      method: 'POST'

    # Tasks
    "/user/tasks":
      description: "Get all user's tasks"

    "/user/tasks/{id}":
      description: "Get an individual task"
      params: [
        swagger.pathParam("id", "Task ID", "string")
      ]

    "/user/tasks/{id}":
      description: "Update a user's task"
      method: 'PUT'
      params: [
        swagger.pathParam("id", "Task ID", "string")
      ]
      body: [
        swagger.bodyParam("task","Send up the whole task","string")
      ]

    "/user/tasks/{id}":
      method: 'DELETE'
    "/user/tasks":
      method: 'POST'
      #body={}
    "/user/tasks/{id}/sort":
      method: 'POST'
      #query={to,from}
    "/user/tasks/clear-completed":
      method: 'POST'
    "/user/tasks/{id}/unlink":
      method: 'POST'

    # Inventory
    "/user/inventory/buy/{key}":
      method: 'POST'
    "/user/inventory/sell/{type}/{key}":
      method: 'POST'
    "/user/inventory/purchase/{type}/{key}":
      method: 'POST'
    "/user/inventory/feed/{pet}/{food}":
      method: 'POST'
    "/user/inventory/equip/{type}/{key}":
      method: 'POST'
    "/user/inventory/hatch/{egg}/{hatchingPotion}":
      method: 'POST'

    # User
    "/user:GET":
      path: '/user'
    "/user:PUT":
      path: '/user'
      method: 'PUT'
      # body={}
    "/user:DELETE":
      path: '/user'
      method: 'DELETE'
    "/user/revive":
      method: 'POST'
    "/user/reroll":
      method: 'POST'
    "/user/reset":
      method: 'POST'
    "/user/sleep":
      method: 'POST'
    "/user/rebirth":
      method: 'POST'
    "/user/class/change":
      method: 'POST'
      #query={class}
    "/user/class/allocate":
      method: 'POST'
      #query={stat}
    "/user/class/cast/:spell":
      method: 'POST'
    "/user/unlock":
      method: 'POST'
    "/user/buy-gems":
      method: 'POST'
    "/user/batch-update":
      method: 'POST'

    # Tags
    "/user/tags":
      method: 'POST'
      #body={}
    "/user/tags/{id}:PUT":
      path: 'user/tags/{id}'
      method: 'PUT'
      #body={}
    "/user/tags/{id}:DELETE":
      path: 'user/tags/{id}'
      method: 'DELETE'

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
    #      params: [swagger.pathParam("petId", "ID of pet that needs to be fetched", "string")]
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
    console.log(spec.params)
    swagger["add#{route.spec.method}"](route);true

  swagger.configure("http://localhost:3000", "0.1")