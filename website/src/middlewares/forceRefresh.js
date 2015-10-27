module.exports.siteVersion = 1;

module.exports.middleware = function(req, res, next){
  if(req.query.siteVersion && req.query.siteVersion != module.exports.siteVersion){
    return res.json(400, {needRefresh: true});
  }

  return next();
};
