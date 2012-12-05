###
  Loads JavaScript files from (1) public/js/* and (2) external sources
  We use this file (instead of <Scripts:> or <Tail:> inside .html) so we can utilize require() to concatinate for
  faster page load, and $.getScript for asyncronous external script loading
###

module.exports = (model) ->

  # Load public/js/* files
  # TODO use Bower
  require '../../public/js/jquery.min'
  require '../../public/js/jquery-ui.min' unless model.get('_mobileDevice')
  require '../../public/js/bootstrap.min' #http://twitter.github.com/bootstrap/assets/js/bootstrap.min.js
  require '../../public/js/jquery.cookie' #https://raw.github.com/carhartl/jquery-cookie/master/jquery.cookie.js
  require '../../public/js/bootstrap-tour' #https://raw.github.com/pushly/bootstrap-tour/master/bootstrap-tour.js
  require '../../public/js/jquery.bootstrap-growl.min'

  # JS files not needed right away (google charts) or entirely optional (analytics)
  # Each file getsload asyncronously via $.getScript, so it doesn't bog page-load
  unless model.get('_mobileDevice')

    # Addthis
    $.getScript "https://s7.addthis.com/js/250/addthis_widget.js#pubid=lefnire"

    # Google Charts
    $.getScript "https://www.google.com/jsapi", ->
      # Specifying callback in options param is vital! Otherwise you get blank screen, see http://stackoverflow.com/a/12200566/362790
      google.load "visualization", "1", {packages:["corechart"], callback: ->}

    # Twitter
    #<!--<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>-->

    # Google Analyatics
    if model.get('_nodeEnv') == 'production'
      _gaq = _gaq || []
      _gaq.push(['_setAccount', 'UA-33510635-1'])
      _gaq.push(['_trackPageview'])

      (->
        ga = document.createElement("script")
        ga.type = "text/javascript"
        ga.async = true
        ga.src = ((if "https:" is document.location.protocol then "https://ssl" else "http://www")) + ".google-analytics.com/ga.js"
        s = document.getElementsByTagName("script")[0]
        s.parentNode.insertBefore ga, s
      )()

