var _ = require('lodash');
var express = require('express');
var csvStringify = require('csv-stringify');
var nconf = require('nconf');
var moment = require('moment');
var js2xmlparser = require("js2xmlparser");
var pd = require('pretty-data').pd;
import {
  model as User,
} from '../../models/user';

// Avatar screenshot/static-page includes
//var Pageres = require('pageres'); //https://github.com/sindresorhus/pageres
//var AWS = require('aws-sdk');
//AWS.config.update({accessKeyId: nconf.get("S3:accessKeyId"), secretAccessKey: nconf.get("S3:secretAccessKey")});
//var s3Stream = require('s3-upload-stream')(new AWS.S3()); //https://github.com/nathanpeck/s3-upload-stream
//var bucket = nconf.get("S3:bucket");
//var request = require('request');

/*
  ------------------------------------------------------------------------
  Data export
  ------------------------------------------------------------------------
*/

var dataexport = module.exports;

dataexport.history = function(req, res) {
  var user = res.locals.user;
  var output = [
    ["Task Name", "Task ID", "Task Type", "Date", "Value"]
  ];
  _.each(user.tasks, function(task) {
    _.each(task.history, function(history) {
      output.push([
        task.text,
        task.id,
        task.type,
        moment(history.date).format("MM-DD-YYYY HH:mm:ss"),
        history.value
      ]);
    });
  });

  res.set({
    'Content-Type': 'text/csv',
    'Content-disposition': `attachment; filename=habitica-tasks-history.csv`,
  });

  csvStringify(output, (err, csv) => {
    if (err) return next(err);
    res.status(200).send(csv);
  });
};

var userdata = function(user) {
  if(user.auth && user.auth.local) {
    delete user.auth.local.salt;
    delete user.auth.local.hashed_password;
  }
  return user;
}

dataexport.leanuser = function(req, res, next) {
  User.findOne({_id: res.locals.user._id}).lean().exec(function(err, user) {
    if (err) return res.status(500).json({err: err});
    if (_.isEmpty(user)) return res.status(401).json(NO_USER_FOUND);
    res.locals.user = user;
    return next();
  });
};

dataexport.userdata = {
  xml: function(req, res) {
      var user = userdata(res.locals.user);
      return res.xml({data: JSON.stringify(user), rootname: 'user'});
    },
  json: function(req, res) {
      var user = userdata(res.locals.user);
      return res.jsonstring(user);
    }
}

/*
  ------------------------------------------------------------------------
  Express Extensions (should be refactored into a module)
  ------------------------------------------------------------------------
*/

var expressres = express.response || http.ServerResponse.prototype;

expressres.xml = function(obj, headers, status) {
  var body = '';
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/xml');
  this.header('Content-Disposition', 'attachment');
  body = pd.xml(js2xmlparser(obj.rootname,obj.data));
  return this.send(body, headers, status);
};

expressres.jsonstring = function(obj, headers, status) {
  var body = '';
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'application/json');
  this.header('Content-Disposition', 'attachment');
  body = pd.json(JSON.stringify(obj));
  return this.send(body, headers, status);
};

/*
 ------------------------------------------------------------------------
 Static page and image screenshot of avatar
 ------------------------------------------------------------------------
 */


dataexport.avatarPage = function(req, res) {
  User.findById(req.params.uuid).select('stats profile items achievements preferences backer contributor').exec(function(err, user){
    res.render('avatar-static', {
      title: user.profile.name,
      env: _.defaults({user:user}, res.locals.habitrpg)
    });
  })
};

dataexport.avatarImage = function(req, res, next) {
  var filename = 'avatars/'+req.params.uuid+'.png';
  request.head('https://'+bucket+'.s3.amazonaws.com/'+filename, function(err,response,body) {
    // cache images for 10 minutes on aws, else upload a new one
    if (response.statusCode==200 && moment().diff(response.headers['last-modified'], 'minutes') < 10)
      return res.redirect(301, 'https://' + bucket + '.s3.amazonaws.com/' + filename);
    new Pageres()//{delay:1}
    .src(nconf.get('BASE_URL') + '/export/avatar-' + req.params.uuid + '.html', ['140x147'], {crop: true, filename: filename.replace('.png', '')})
    .run()
    .then(function (file) {
      var upload = s3Stream.upload({
        Bucket: bucket,
        Key: filename,
        ACL: "public-read",
        StorageClass: "REDUCED_REDUNDANCY",
        ContentType: "image/png",
        Expires: +moment().add({minutes: 3})
      });
      upload.on('error', function (err) {
        next(err);
      });
      upload.on('uploaded', function (details) {
        res.redirect(details.Location);
      });
      file[0].pipe(upload);
    }).catch(next);
  })
};
