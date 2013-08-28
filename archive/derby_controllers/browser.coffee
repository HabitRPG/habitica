_ = require 'lodash'
moment = require 'moment'

###
  Loads JavaScript files from public/vendor/*
  Use require() to min / concatinate for faster page load
###
loadJavaScripts = (model) ->

  # Turns out you can't have expressions in browserify require() statements
  #vendor = '../../public/vendor'
  #require "#{vendor}/jquery-ui-1.10.2/jquery-1.9.1"

  ###
  Internal Scripts
  ###
  require "../vendor/jquery-ui-1.10.2/jquery-1.9.1.js"
  require "../vendor/jquery.cookie.min.js"
  require "../vendor/bootstrap/js/bootstrap.min.js"
  require "../vendor/jquery.bootstrap-growl.min.js"
  require "../vendor/datepicker/js/bootstrap-datepicker"
  require "../vendor/bootstrap-tour/bootstrap-tour"

  unless (model.get('_mobileDevice') is true)
    require "../vendor/jquery-ui-1.10.2/ui/jquery.ui.core.js"
    require "../vendor/jquery-ui-1.10.2/ui/jquery.ui.widget.js"
    require "../vendor/jquery-ui-1.10.2/ui/jquery.ui.mouse.js"
    require "../vendor/jquery-ui-1.10.2/ui/jquery.ui.sortable.js"
    require "../vendor/sticky"

  # note: external script loading is handled in app.on('render') near the bottom of this file (see https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/x8FwdTLEuXo)

###
  Setup jQuery UI Sortable
###
setupSortable = (model) ->
  unless (model.get('_mobileDevice') is true) #don't do sortable on mobile
    ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
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

setupTooltips = module.exports.setupTooltips = ->
  $('[rel=tooltip]').tooltip()
  $('[rel=popover]').popover()
  $('.popover-auto-show').popover('show')

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
  tourSteps.forEach (step) -> tour.addStep _.defaults step, {html:true}
  tour._current = 0 if isNaN(tour._current) #bootstrap-tour bug
  tour.start()


# jquery sticky header on scroll, no need for position fixed
initStickyHeader = (model) ->
  $('.header-wrap').sticky({topSpacing:0})

growlNotification = module.exports.growlNotification = (html, type) ->
  $.bootstrapGrowl html,
    ele: '#notification-area',
    type: type # (null, 'info', 'error', 'success', 'gp', 'xp', 'hp', 'lvl','death')
    top_offset: 20
    align: 'right' # ('left', 'right', or 'center')
    width: 250 # (integer, or 'auto')
    delay: 3000
    allow_dismiss: true
    stackup_spacing: 10 # spacing between consecutive stacecked growls.

###
  Sets up "+1 Exp", "Level Up", etc notifications
###
setupGrowlNotifications = (model) ->
  return unless jQuery? # Only run this in the browser
  user = model.at '_user'

  statsNotification = (html, type) ->
    return if user.get('stats.lvl') == 0 #don't show notifications if user dead
    growlNotification(html, type)

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

  ###
    Show "+ 5 {gold_coin} 3 {silver_coin}"
  ###
  showCoins = (money) ->
    absolute = Math.abs(money)
    gold = Math.floor(absolute)
    silver = Math.floor((absolute-gold)*100)
    if gold and silver > 0
      return "#{gold} <i class='icon-gold'></i> #{silver} <i class='icon-silver'></i>"
    else if gold > 0
      return "#{gold} <i class='icon-gold'></i>"
    else if silver > 0
      return "#{silver} <i class='icon-silver'></i>"

  user.on 'set', 'stats.gp', (captures, args) ->
    money = captures - args
    return unless !!money # why is this happening? gotta find where stats.gp is being set from (-)habit
    sign = if money < 0 then '-' else '+'
    statsNotification "#{sign} #{showCoins(money)}", 'gp'

    # Append Bonus
    bonus = model.get('_streakBonus')
    if (money > 0) and !!bonus
      bonus = 0.01 if bonus < 0.01
      statsNotification "+ #{showCoins(bonus)}  Streak Bonus!"
      model.del('_streakBonus')

  user.on 'set', 'items.*', (item, after, before) ->
    if item in ['armor','weapon','shield','head'] and parseInt(after) < parseInt(before)
      item = 'helm' if item is 'head' # don't want to day "lost a head"
      statsNotification "<i class='icon-death'></i> Respawn!", "death"

  user.on 'set', 'stats.lvl', (captures, args) ->
    if captures > args
      statsNotification '<i class="icon-chevron-up"></i> Level Up!', 'lvl'



module.exports.app = (appExports, model, app) ->
  loadJavaScripts(model)
  setupGrowlNotifications(model) unless model.get('_mobileDevice')

  app.on 'render', (ctx) ->
    #restoreRefs(model)
    unless model.get('_mobileDevice')
      setupTooltips(model)
      initStickyHeader(model)
      setupSortable(model)
      setupTour(model)

    $('.datepicker').datepicker({autoclose:true, todayBtn:true})
      .on 'changeDate', (ev) ->
        #for some reason selecting a date doesn't fire a change event on the field, meaning our changes aren't saved
        model.at(ev.target).set 'date', moment(ev.date).format('MM/DD/YYYY')

