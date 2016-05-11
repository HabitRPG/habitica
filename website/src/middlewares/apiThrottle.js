var nconf = require('nconf');
var limiter = require('connect-ratelimit');

var IS_PROD = nconf.get('NODE_ENV') === 'production';

// TODO since Habitica runs on many different servers this module is pretty useless
// as it will only block requests that go to the same server but anyway we should probably have a rate limiter in place

module.exports = function(app) {
  // disable the rate limiter middleware
  if (/*!IS_PROD || */true) return;
  app.use(limiter({
    end:false,
    categories:{
      normal: {
        // 2 req/s, but split as minutes
        totalRequests: 80,
        every:         60000
      }
    }
  })).use(function(req,res,next){
    //logging.info(res.ratelimit);
    if (res.ratelimit.exceeded) return res.status(429).json({err:'Rate limit exceeded'});
    next();
  });
};
