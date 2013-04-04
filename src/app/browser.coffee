_ = require 'underscore'
moment = require 'moment'
#algos = require './algos'

###
  Loads JavaScript files from public/js/*
  If a library is available in a CDN, we put it in <Scripts:> (index.html) for better caching. If not, we use
  this function to utilize require() to concatinate for faster page load
###
loadJavaScripts = (model) ->

  unless model.get('_view.mobileDevice')
    require '../../public/vendor/jquery-ui/ui/jquery.ui.core'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.widget'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.mouse'
    require '../../public/vendor/jquery-ui/ui/jquery.ui.sortable'
    require '../../public/sticky.js'

  require '../../public/vendor/bootstrap-tour/bootstrap-tour'


###
  Setup jQuery UI Sortable
###
setupSortable = (model) ->
  unless (model.get('_view.mobileDevice') == true) #don't do sortable on mobile
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      $("ul.#{type}s").sortable
        dropOnEmpty: false
        cursor: "move"
        items: "li"
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

setupTooltips = module.exports.setupTooltips = (model) ->
  $('[rel=tooltip]').tooltip()
  $('[rel=popover]').popover()

  $('.priority-multiplier-help').popover
    title: "How difficult is this task?"
    trigger: "hover"
    content: "This multiplies its point value. Use sparingly, rely instead on our organic value-adjustment algorithms. But some tasks are grossly more valuable (Write Thesis vs Floss Teeth). Click for more info."

setupTour = (model) ->
  tourSteps = [
    {
      element: ".main-herobox"
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

  $('.main-herobox').popover('destroy') #remove previous popovers
  tour = new Tour()
  _.each tourSteps, (step) ->
    tour.addStep _.defaults step, {html:true}
  tour._current = 0 if isNaN(tour._current) #bootstrap-tour bug
  tour.start()


# jquery sticky header on scroll, no need for position fixed
initStickyHeader = (model) ->
  $('.header-wrap').sticky({topSpacing:0})

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
      type: type # (null, 'info', 'error', 'success', 'gp', 'xp', 'hp', 'lvl','death')
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
      statsNotification "<i class='icon-heart'></i> - #{rounded} HP", 'hp' # lost hp from purchase
    else if num > 0
      statsNotification "<i class='icon-heart'></i> + #{rounded} HP", 'hp' # gained hp from potion/level? 
  
  user.on 'set', 'stats.exp', (captures, args, isLocal, silent=false) ->
    # unless silent
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    if num < 0 and num > -50 # TODO fix hackey negative notification supress
      statsNotification "<i class='icon-star'></i> - #{rounded} XP", 'xp'
    else if num > 0
      statsNotification "<i class='icon-star'></i> + #{rounded} XP", 'xp'

  user.on 'set', 'stats.gp', (captures, args) ->
    num = captures - args
    absolute = Math.abs(num)
    gold = Math.floor(absolute)
    silver = Math.floor((absolute-gold)*100)
    sign = if num < 0 then '-' else '+'
    if gold and silver > 0
      statsNotification "#{sign} #{gold} <i class='icon-gold'></i> #{silver} <i class='icon-silver'></i>", 'gp'
    else if gold > 0
      statsNotification "#{sign} #{gold} <i class='icon-gold'></i>", 'gp'
    else if silver > 0
      statsNotification "#{sign} #{silver} <i class='icon-silver'></i>", 'gp'

  user.on 'set', 'stats.lvl', (captures, args) ->
    if captures > args
      if captures is 1 and args is 0
        statsNotification '<i class="icon-death"></i> You died! Game over.', 'death' 
      else 
        statsNotification '<i class="icon-chevron-up"></i> Level Up!', 'lvl'


module.exports.resetDom = (model) ->
  DERBY.app.dom.clear()
  DERBY.app.view.render(model, DERBY.app.view._lastRender.ns, DERBY.app.view._lastRender.context);

###
  Load external scripts that need re-calculation on page re-write
###
loadExternalScripts = (model) ->
  $.getScript('//checkout.stripe.com/v2/checkout.js')

  # JS files not needed right away (google charts) or entirely optional (analytics)
  # Each file getsload asyncronously via $.getScript, so it doesn't bog page-load
  unless model.get('_view.mobileDevice')

    $.getScript("//s7.addthis.com/js/250/addthis_widget.js#pubid=lefnire")

    # Google Charts
    $.getScript "//www.google.com/jsapi", ->
      # Specifying callback in options param is vital! Otherwise you get blank screen, see http://stackoverflow.com/a/12200566/362790
      google.load "visualization", "1", {packages:["corechart"], callback: ->}

# Note, Google Analyatics giving beef if in this file. Moved back to index.html. It's ok, it's async - really the
# syncronous requires up top are what benefit the most from this file.

module.exports.app = (appExports, model, app) ->
  loadJavaScripts(model)
  setupGrowlNotifications(model) unless model.get('_view.mobileDevice')

  app.on 'render', (ctx) ->
    #restoreRefs(model)
    setupSortable(model)
    setupTooltips(model)
    setupTour(model)
    initStickyHeader(model) unless model.get('_view.mobileDevice')
    loadExternalScripts(model)
    $('.datepicker').datepicker({autoclose:true, todayBtn:true})
      .on 'changeDate', (ev) ->
        #for some reason selecting a date doesn't fire a change event on the field, meaning our changes aren't saved
        #FIXME also, it saves as a day behind??
        model.at(ev.target).set 'date', moment(ev.date).add('d',1).format('MM/DD/YYYY')