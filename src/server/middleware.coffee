module.exports.splash = (req, res, next) ->
  isStatic = req.url.split('/')[1] is 'static'
  unless req.query?.play? or req.getModel().get('_userId') or isStatic
    res.redirect('/static/front')
  else
    next()

module.exports.view = (req, res, next) ->
  model = req.getModel()
  ## Set _mobileDevice to true or false so view can exclude portions from mobile device
  model.set '_mobileDevice', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
  model.set '_nodeEnv', model.flags.nodeEnv
  next()

#CORS middleware
module.exports.allowCrossDomain = (req, res, next) ->
  res.header "Access-Control-Allow-Origin", (req.headers.origin || "*")
  res.header "Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,HEAD,DELETE"
  res.header "Access-Control-Allow-Headers", "Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key"

  # wtf is this for?
  if req.method is 'OPTIONS'
    res.send(200);
  else
    next()
