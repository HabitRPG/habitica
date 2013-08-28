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
  require "../vendor/jquery.cookie.min.js"
  require "../vendor/bootstrap/js/bootstrap.min.js"
  require "../vendor/jquery.bootstrap-growl.min.js"
  require "../vendor/datepicker/js/bootstrap-datepicker"
  require "../vendor/bootstrap-tour/bootstrap-tour"

  unless (model.get('_mobileDevice') is true)
    require "../vendor/sticky"

  # note: external script loading is handled in app.on('render') near the bottom of this file (see https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/x8FwdTLEuXo)


setupTooltips = module.exports.setupTooltips = ->
  $('.popover-auto-show').popover('show')

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



module.exports.app = (appExports, model, app) ->

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

