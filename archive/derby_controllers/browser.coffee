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
  require "../vendor/datepicker/js/bootstrap-datepicker"
  require "../vendor/bootstrap-tour/bootstrap-tour"

  unless (model.get('_mobileDevice') is true)
    require "../vendor/sticky"

  # note: external script loading is handled in app.on('render') near the bottom of this file (see https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/x8FwdTLEuXo)


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

    $('.datepicker').datepicker({autoclose:true, todayBtn:true})
      .on 'changeDate', (ev) ->
        #for some reason selecting a date doesn't fire a change event on the field, meaning our changes aren't saved
        model.at(ev.target).set 'date', moment(ev.date).format('MM/DD/YYYY')

