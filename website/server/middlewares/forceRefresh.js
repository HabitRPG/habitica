// TODO do we need this module anymore in v3? No

module.exports.siteVersion = 1;

module.exports.middleware = function(req, res, next){
  if(req.query.siteVersion && req.query.siteVersion != module.exports.siteVersion){
    return res.status(400).json({needRefresh: true});
  }

  return next();
};
