var User = require('../models/user');
var EmailUnsubscription = require('../models/emailUnsubscription');
var utils = require('../utils');

var api = module.exports = {};

api.unsubscribe = function(req, res, next){
  if(!req.query.code) return next(new Error('Missing unsubscription code.'));

  var data = JSON.parse(utils.decrypt(req.query.code));

  if(data._id){
    User.update({_id: data._id}, {
      $set: {}
    }, {multi: false}, function(err, nAffected){
      if(err) return next(err);
      if(nAffected !== 1) return next(new Error('User not found'));

      res.send('Unsubscribed!');
    });
  }else{
    EmailUnsubscription.findOne({email: data.email}, function(err, res){
      if(err) return next(err);
      if(res) return next(new Error('Email address already unsubscribed'));

      EmailUnsubscription.create({email: data.email}, function(err, res){
        if(err) return next(err);
        
        res.send('Unsubscribed!');
      })
    });
  }
};