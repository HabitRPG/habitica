content = require('./content')

###
  Loads JavaScript files from (1) public/js/* and (2) external sources
  We use this file (instead of <Scripts:> or <Tail:> inside .html) so we can utilize require() to concatinate for
  faster page load, and $.getScript for asyncronous external script loading
###
module.exports.loadJavaScripts = (model) ->

  # Load public/js/* files
  # TODO use Bower
  require '../../public/js/jquery.min'
  require '../../public/js/jquery-ui.min' unless model.get('_view.mobileDevice')
  require '../../public/js/bootstrap.min' #http://twitter.github.com/bootstrap/assets/js/bootstrap.min.js
  require '../../public/js/jquery.cookie' #https://raw.github.com/carhartl/jquery-cookie/master/jquery.cookie.js
  require '../../public/js/bootstrap-tour' #https://raw.github.com/pushly/bootstrap-tour/master/bootstrap-tour.js
  require '../../public/js/jquery.bootstrap-growl.min'

  # JS files not needed right away (google charts) or entirely optional (analytics)
  # Each file getsload asyncronously via $.getScript, so it doesn't bog page-load
  unless model.get('_view.mobileDevice')

    # Addthis
    $.getScript "https://s7.addthis.com/js/250/addthis_widget.js#pubid=lefnire"

    # Google Charts
    $.getScript "https://www.google.com/jsapi", ->
      # Specifying callback in options param is vital! Otherwise you get blank screen, see http://stackoverflow.com/a/12200566/362790
      google.load "visualization", "1", {packages:["corechart"], callback: ->}

# Note, Google Analyatics giving beef if in this file. Moved back to index.html. It's ok, it's async - really the
# syncronous requires up top are what benefit the most from this file.

###
  Setup jQuery UI Sortable
###
module.exports.setupSortable = (model) ->
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
    setupSortable(type) for type in ['habit', 'daily', 'todo', 'reward']

module.exports.setupTooltips = (model) ->
  $('[rel=tooltip]').tooltip()
  $('[rel=popover]').popover()
  # FIXME: this isn't very efficient, do model.on set for specific attrs for popover
  model.on 'set', '*', ->
    $('[rel=tooltip]').tooltip()
    $('[rel=popover]').popover()


module.exports.setupTour = (model) ->
  tour = new Tour()
  for step in content.tourSteps
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
module.exports.setupGrowlNotifications = (model) ->
  return unless jQuery? # Only run this in the browser
  user = model.at '_user'

  statsNotification = (html, type) ->
    #don't show notifications if user dead
    return if user.get('stats.lvl') == 0
    $.bootstrapGrowl html,
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

  user.on 'set', 'stats.money', (captures, args) ->
    num = captures - args
    rounded = Math.abs(num.toFixed(1))
    # made purchase
    if num < 0
      # FIXME use 'warning' when unchecking an accidently completed daily/todo, and notify of exp too
      statsNotification "<i class='icon-star'></i>GP -#{rounded}", 'success'
      # gained money (and thereby exp)
    else if num > 0
      num = Math.abs(num)
      statsNotification "<i class='icon-star'></i>Exp,GP +#{rounded}", 'success'

  user.on 'set', 'stats.lvl', (captures, args) ->
    if captures > args
      statsNotification('<i class="icon-chevron-up"></i> Level Up!', 'info')