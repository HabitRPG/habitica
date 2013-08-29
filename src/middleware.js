var nconf = require('nconf');
var _ = require('lodash');

module.exports = function(req, res, next) {
  /*
  //splash = (req, res, next) ->
  //  isStatic = req.url.split('/')[1] is 'static'
  //  unless req.query?.play? or req.getModel().get('_userId') or isStatic
  //    res.redirect('/static/front')
  //  else
  //    next()
  */

  /* Set _mobileDevice to true or false so view can exclude portions from mobile device*/

  var _base;
  _.defaults(((_base = res.locals).habitrpg != null ? (_base = res.locals).habitrpg : _base.habitrpg = {}), {
    NODE_ENV: nconf.get('NODE_ENV'),
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent'))
  });
  /*CORS middleware*/

  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,HEAD,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key");
  /* wtf is this for?*/

  if (req.method === 'OPTIONS') {
    return res.send(200);
  }
  /*
  //  translate = (req, res, next) ->
  //    model = req.getModel()
  //    # Set locale to bg on dev
  //    #model.set '_i18n.locale', 'bg' if process.env.NODE_ENV is "development"
  //    next()
  */

  return next();
};
