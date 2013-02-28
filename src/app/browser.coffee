_ = require 'underscore'
moment = require 'moment'

module.exports.restoreRefs = restoreRefs = (model) ->
  # tnl function
  model.fn '_tnl', '_user.stats.lvl', (lvl) ->
    # see https://github.com/lefnire/habitrpg/issues/4
    # also update in scoring.coffee. TODO create a function accessible in both locations
    (lvl*100)/5

  #refLists
  _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"

module.exports.resetDom = (model) ->
  window.DERBY.app.dom.clear()
  restoreRefs(model)
  window.DERBY.app.view.render(model)
  reconstructPage model

module.exports.app = (appExports, model) ->
  reconstructPage model

reconstructPage = (model) ->
  loadJavaScripts(model)
  setupSortable(model)
  setupTooltips(model)
  setupTour(model)
  setupGrowlNotifications(model) unless model.get('_view.mobileDevice')
  $('.datepicker').datepicker({autoclose:true, todayBtn:true})
  .on 'changeDate', (ev) ->
    #for some reason selecting a date doesn't fire a change event on the field, meaning our changes aren't saved
    #FIXME also, it saves as a day behind??
    model.at(ev.target).set 'date', moment(ev.date).add('d',1).format('MM/DD/YYYY')

###
  Loads JavaScript files from (1) public/js/* and (2) external sources
  We use this file (instead of <Scripts:> or <Tail:> inside .html) so we can utilize require() to concatinate for
  faster page load, and $.getScript for asyncronous external script loading
###
loadJavaScripts = (model) ->

  require '../../public/vendor/jquery-ui/jquery-1.9.1'
  unless model.get('_view.mobileDevice')
    require '../../public/vendor/jquery-ui/ui/jquery.ui.core'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.widget'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.mouse'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.sortable'

  # Bootstrap
  require '../../public/vendor/bootstrap/docs/assets/js/bootstrap'
#  require '../../public/vendor/bootstrap/js/bootstrap-tooltip'
#  require '../../public/vendor/bootstrap/js/bootstrap-tab'
#  require '../../public/vendor/bootstrap/js/bootstrap-popover'
#  require '../../public/vendor/bootstrap/js/bootstrap-modal'
#  require '../../public/vendor/bootstrap/js/bootstrap-dropdown'


  require '../../public/vendor/jquery-cookie/jquery.cookie'
  require '../../public/vendor/bootstrap-tour' #https://raw.github.com/pushly/bootstrap-tour/master/bootstrap-tour.js
  require '../../public/vendor/bootstrap-datepicker/js/bootstrap-datepicker'
  require '../../public/vendor/bootstrap-growl/jquery.bootstrap-growl.min'


  # JS files not needed right away (google charts) or entirely optional (analytics)
  # Each file getsload asyncronously via $.getScript, so it doesn't bog page-load
  unless model.get('_view.mobileDevice')

    $.getScript("https://s7.addthis.com/js/250/addthis_widget.js#pubid=lefnire");

    # Google Charts
    $.getScript "https://www.google.com/jsapi", ->
      # Specifying callback in options param is vital! Otherwise you get blank screen, see http://stackoverflow.com/a/12200566/362790
      google.load "visualization", "1", {packages:["corechart"], callback: ->}

# Note, Google Analyatics giving beef if in this file. Moved back to index.html. It's ok, it's async - really the
# syncronous requires up top are what benefit the most from this file.

###
  Setup jQuery UI Sortable
###
setupSortable = (model) ->
  unless (model.get('_view.mobileDevice') == true) #don't do sortable on mobile
    # Make the lists draggable using jQuery UI
    # Note, have to setup helper function here and call it for each type later
    # due to variable binding of "type"
    setupSortable = (type) ->
      $("ul.#{type}s").sortable
        dropOnEmpty: false
        cursor: "move"
        items: "li"
        opacity: 0.4
        scroll: true
        axis: 'y'
        update: (e, ui) ->
          item = ui.item[0]
          domId = item.id
          id = item.getAttribute 'data-id'
          to = $("ul.#{type}s").children().index(item)
          # Use the Derby ignore option to suppress the normal move event
          # binding, since jQuery UI will move the element in the DOM.
          # Also, note that refList index arguments can either be an index
          # or the item's id property
          model.at("_#{type}List").pass(ignore: domId).move {id}, to
    _.each ['habit', 'daily', 'todo', 'reward'], (type) -> setupSortable(type)

setupTooltips = (model) ->
  $('[rel=tooltip]').tooltip()
  $('[rel=popover]').popover()
  # FIXME: this isn't very efficient, do model.on set for specific attrs for popover
  model.on 'set', '*', ->
    $('[rel=tooltip]').tooltip()
    $('[rel=popover]').popover()


setupTour = (model) ->
  tourSteps = [
    {
      element: ".main-avatar"
      title: "Welcome to HabitRPG"
      content: "Welcome to HabitRPG, a habit-tracker which treats your goals like a Role Playing Game."
    }
    {
      element: "#bars"
      title: "Achieve goals and level up"
      content: "As you accomplish goals, you level up. If you fail your goals, you lose hit points. Lose all your HP and you die."
    }
    {
      element: "ul.habits"
      title: "Habits"
      content: "Habits are goals that you constantly track."
      placement: "bottom"
    }
    {
      element: "ul.dailys"
      title: "Dailies"
      content: "Dailies are goals that you want to complete once a day."
      placement: "bottom"
    }
    {
      element: "ul.todos"
      title: "Todos"
      content: "Todos are one-off goals which need to be completed eventually."
      placement: "bottom"
    }
    {
      element: "ul.rewards"
      title: "Rewards"
      content: "As you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits."
      placement: "bottom"
    }
    {
      element: "ul.habits li:first-child"
      title: "Hover over comments"
      content: "Different task-types have special properties. Hover over each task's comment for more information. When you're ready to get started, delete the existing tasks and add your own."
      placement: "right"
    }
  ]

  $('.main-avatar').popover('destroy') #remove previous popovers
  tour = new Tour()
  _.each tourSteps, (step) ->
    tour.addStep
      html: true
      element: step.element
      title: step.title
      content: step.content
      placement: step.placement
  tour.start()

###
  Sets up "+1 Exp", "Level Up", etc notifications
###
setupGrowlNotifications = (model) ->
  return unless jQuery? # Only run this in the browser
  user = model.at '_user'

  statsNotification = (html, type) ->
    #don't show notifications if user dead
    return if user.get('stats.lvl') == 0
    $.bootstrapGrowl html,
      ele: '#notification-area',
      type: type # (null, 'info', 'error', 'success')
      top_offset: 20
      align: 'right' # ('left', 'right', or 'center')
      width: 250 # (integer, or 'auto')
      delay: 3000
      allow_dismiss: true
      stackup_spacing: 10 # spacing between consecutive stacecked growls.

  # Setup listeners which trigger notifications
  user.on 'set', 'stats.hp', (captures, args) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    if num < 0
      statsNotification "<i class='icon-heart'></i>HP -#{rounded}", 'error' # lost hp from purchase

  user.on 'set', 'stats.gp', (captures, args) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    # made purchase
    if num < 0
      # FIXME use 'warning' when unchecking an accidently completed daily/todo, and notify of exp too
      statsNotification "<i class='icon-star'></i>GP -#{rounded}", 'success'
      # gained gp (and thereby exp)
    else if num > 0
      num = Math.abs(num)
      statsNotification "<i class='icon-star'></i>Exp,GP +#{rounded}", 'success'

  user.on 'set', 'stats.lvl', (captures, args) ->
    if captures > args
      statsNotification('<i class="icon-chevron-up"></i> Level Up!', 'info')