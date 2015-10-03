var nconf = require('nconf');
var moment = require('moment');
var domainMiddleware = require('domain-middleware');
var os = require('os');
var request = require('request');

var IS_PROD = nconf.get('NODE_ENV') === 'production';

module.exports = function(server,mongoose) {
  if (IS_PROD) {
    var mins = 3, // how often to run this check
      useAvg = false, // use average over 3 minutes, or simply the last minute's report
      url = 'https://api.newrelic.com/v2/applications/'+nconf.get('NEW_RELIC_APPLICATION_ID')+'/metrics/data.json?names[]=Apdex&values[]=score';
    setInterval(function(){
      // see https://docs.newrelic.com/docs/apm/apis/api-v2-examples/average-response-time-examples-api-v2, https://rpm.newrelic.com/api/explore/applications/data
      request({
        url: useAvg ? url+'&from='+moment().subtract({minutes:mins}).utc().format()+'&to='+moment().utc().format()+'&summarize=true' : url,
        headers: {'X-Api-Key': nconf.get('NEW_RELIC_API_KEY')}
      }, function(err, response, body){
        var ts = JSON.parse(body).metric_data.metrics[0].timeslices,
          score = ts[ts.length-1].values.score,
          apdexBad = score < .75 || score == 1,
          memory = os.freemem() / os.totalmem(),
          memoryHigh = memory < 0.1;
        if (/*apdexBad || */memoryHigh) throw '[Memory Leak] Apdex='+score+' Memory='+parseFloat(memory).toFixed(3)+' Time='+moment().format();
      });
    }, mins*60*1000);
  }

  return domainMiddleware({
    server: {
      close:function(){
        server.close();
        mongoose.connection.close();
      }
    },
    killTimeout: 10000
  });
};
