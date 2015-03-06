_ = require 'lodash'
{helpers} = require 'habitrpg-shared'
async = require 'async'

module.exports.app = (app) ->

  ###
    Sync any updates to challenges since last refresh. Do it after cron, so we don't punish them for new tasks
    This is challenge->user sync. user->challenge happens when user interacts with their tasks
  ###
  app.on 'ready', (model) ->
    window.setTimeout ->
      _.each model.get('groups'), (g) ->
        if (@uid in g.members) and g.challenges
          _.each(g.challenges, ->app.challenges.syncChalToUser g)
        true
    , 500

  ###
    Sync user to challenge (when they score, add to statistics)
  ###
  app.model.on "change", "_page.user.priv.tasks.*.value", (id, value, previous, passed) ->
    ### Sync to challenge, but do it later ###
    async.nextTick =>
      model = app.model
      ctx = {model: model}
      task = model.at "_page.user.priv.tasks.#{id}"
      tobj = task.get()
      pub = model.get "_page.user.pub"

      if (chalTask = helpers.taskInChallenge.call ctx, tobj)? and chalTask.get()
        chalTask.increment "value", value - previous
        chal = model.at "groups.#{tobj.group.id}.challenges.#{tobj.challenge}"
        chalUser = -> helpers.indexedAt.call(ctx, chal.path(), 'members', {id:pub.id})
        cu = chalUser()
        unless cu?.get()
          chal.push "members", {id: pub.id, name: model.get(pub.profile.name)}
          cu = model.at chalUser()
        else
          cu.set 'name', pub.profile.name # update their name incase it changed
        cu.set "#{tobj.type}s.#{tobj.id}",
          value: tobj.value
          history: tobj.history

  ###
    Render graphs for user scores when the "Challenges" tab is clicked
  ###

  ###
  TODO
  1) on main tab click or party
    * sort & render graphs for party
  2) guild -> all guilds
  3) public -> all public
  ###


  ###
  $('#profile-challenges-tab-link').on 'shown', ->
    async.each _.toArray(model.get('groups')), (g) ->
      async.each _.toArray(g.challenges), (chal) ->
        async.each _.toArray(chal.tasks), (task) ->
          async.each _.toArray(chal.members), (member) ->
            if (history = member?["#{task.type}s"]?[task.id]?.history) and !!history
              data = google.visualization.arrayToDataTable _.map(history, (h)-> [h.date,h.value])
              options =
                backgroundColor: { fill:'transparent' }
                width: 150
                height: 50
                chartArea: width: '80%', height: '80%'
                axisTitlePosition: 'none'
                legend: position: 'bottom'
                hAxis: gridlines: color: 'transparent' # since you can't seem to *remove* gridlines...
                vAxis: gridlines: color: 'transparent'
              chart = new google.visualization.LineChart $(".challenge-#{chal.id}-member-#{member.id}-history-#{task.id}")[0]
              chart.draw(data, options)
  ###

  app.fn
    challenges:

      ###
        Create
      ###
      create: (e,el) ->
        [type, gid] = [$(el).attr('data-type'), $(el).attr('data-gid')]
        cid = @model.id()
        @model.set '_page.new.challenge',
          id: cid
          name: ''
          habits: []
          dailys: []
          todos: []
          rewards: []
          user:
            uid: @uid
            name: @pub.get('profile.name')
          group: {type, id:gid}
          timestamp: +new Date

      ###
        Save
      ###
      save: ->
        newChal = @model.get('_page.new.challenge')
        [gid, cid] = [newChal.group.id, newChal.id]
        @model.push "_page.lists.challenges.#{gid}", newChal, ->
          app.browser.growlNotification('Challenge Created','success')
          app.challenges.discard()
          app.browser.resetDom() # something is going absolutely haywire here, all model data at end of reflist after chal created

      ###
        Toggle Edit
      ###
      toggleEdit: (e, el) ->
        path = "_page.editing.challenges.#{$(el).attr('data-id')}"
        @model.set path, !@model.get(path)

      ###
        Discard
      ###
      discard: ->
        @model.del '_page.new.challenge'

      ###
        Delete
      ###
      delete: (e) ->
        return unless confirm("Delete challenge, are you sure?") is true
        e.at().remove()

      ###
        Add challenge name as a tag for user
      ###
      syncChalToUser: (chal) ->
        return unless chal
        ### Sync tags ###
        tags = @priv.get('tags') or []
        idx = _.findIndex tags, {id: chal.id}
        if ~idx and (tags[idx].name isnt chal.name)
          ### update the name - it's been changed since ###
          @priv.set "tags.#{idx}.name", chal.name
        else
          @priv.push 'tags', {id: chal.id, name: chal.name, challenge: true}

        tags = {}; tags[chal.id] = true
        _.each chal.habits.concat(chal.dailys.concat(chal.todos.concat(chal.rewards))), (task) =>
          _.defaults task, { tags, challenge: chal.id, group: {id: chal.group.id, type: chal.group.type} }
          path = "tasks.#{task.id}"
          if @priv.get path
            @priv.set path, _.defaults(@priv.get(path), task)
          else
            @model.push "_page.lists.tasks.#{@uid}.#{task.type}s", task
          true

      ###
        Subscribe
      ###
      subscribe: (e) ->
        chal = e.get()
        ### Add all challenge's tasks to user's tasks ###
        currChallenges = @pub.get('challenges')
        @pub.unshift('challenges', chal.id) unless currChallenges and ~currChallenges.indexOf(chal.id)
        e.at().push "members",
          id: @uid
          name: @pub.get('profile.name')
        app.challenges.syncChalToUser(chal)

      ###
      --------------------------
       Unsubscribe functions
      --------------------------
      ###

      unsubscribe: (chal, keep=true) ->

        ### Remove challenge from user ###
        i = @pub.get('challenges')?.indexOf(chal.id)
        if i? and ~i
          @pub.remove("challenges", i, 1)

        ### Remove user from challenge ###
        if ~(i = _.findIndex chal.members, {id: @uid})
          @model.remove "groups.#{chal.group.id}.challenges.#{chal.id}.members", i, 1

        ### Remove tasks from user ###
        async.each chal.habits.concat(chal.dailys.concat(chal.todos.concat(chal.rewards))), (task) =>
          if keep is true
            @priv.del "tasks.#{task.id}.challenge"
          else
            path = "_page.lists.tasks.#{@uid}.#{task.type}s"
            if ~(i = _.findIndex(@model.get(path), {id:task.id}))
              @model.remove(path, i, 1)
          true

      taskUnsubscribe: (e, el) ->

        ###
          since the challenge was deleted, we don't have its data to unsubscribe from - but we have the vestiges on the task
          FIXME this is a really dumb way of doing this
        ###
        tasks = @priv.get('tasks')
        tobj = tasks[$(el).attr("data-tid")]
        deletedChal =
          id: tobj.challenge
          members: [@uid]
          habits: _.where tasks,  {type: 'habit', challenge: tobj.challenge}
          dailys: _.where tasks,  {type: 'daily', challenge: tobj.challenge}
          todos: _.where tasks,   {type: 'todo', challenge: tobj.challenge}
          rewards: _.where tasks, {type: 'reward', challenge: tobj.challenge}

        switch $(el).attr('data-action')
          when 'keep'
            @priv.del "tasks.#{tobj.id}.challenge"
            @priv.del "tasks.#{tobj.id}.group"
          when 'keep-all'
            app.challenges.unsubscribe.call @, deletedChal, true
          when 'remove'
            path = "_page.lists.tasks.#{@uid}.#{tobj.type}s"
            if ~(i = _.findIndex @model.get(path), {id: tobj.id})
              @model.remove path, i
          when 'remove-all'
            app.challenges.unsubscribe.call @, deletedChal, false

      challengeUnsubscribe: (e, el) ->
        $(el).popover('destroy').popover({
          html: true
          placement: 'top'
          trigger: 'manual'
          title: 'Unsubscribe From Challenge And:'
          content: """
                   <a class=challenge-unsubscribe-and-remove>Remove Tasks</a><br/>
                   <a class=challenge-unsubscribe-and-keep>Keep Tasks</a><br/>
                   <a class=challenge-unsubscribe-cancel>Cancel</a><br/>
                   """
        }).popover('show')
        $('.challenge-unsubscribe-and-remove').click => app.challenges.unsubscribe.call @, e.get(), false
        $('.challenge-unsubscribe-and-keep').click => app.challenges.unsubscribe.call @, e.get(), true
        $('[class^=challenge-unsubscribe]').click => $(el).popover('destroy')