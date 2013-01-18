###
  Loads JavaScript files from (1) public/js/* and (2) external sources
  We use this file (instead of <Scripts:> or <Tail:> inside .html) so we can utilize require() to concatinate for
  faster page load, and $.getScript for asyncronous external script loading
###

module.exports = (model) ->

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
