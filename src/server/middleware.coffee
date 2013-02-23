module.exports.splash = (req, res, next) ->
  # This was an API call, not a page load
return next() if /^\/(api)|(v1)/.test req.path

unless req.query?.play? or req.getModel().get('_userId')
  res.redirect('/splash.html')
else
  next()

module.exports.view = (req, res, next) ->
    model = req.getModel()
    _view = model.get('_view') || {}
    ## Set _mobileDevice to true or false so view can exclude portions from mobile device
    _view.mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
    _view.nodeEnv = process.env.NODE_ENV
    model.set '_view', _view
    next()
