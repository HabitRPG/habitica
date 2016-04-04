import {
  model as User,
} from '../../models/user';
import {
  model as EmailUnsubscription,
} from '../../models/emailUnsubscription';
var utils = require('../../libs/api-v2/utils');
var i18n = require('../../../../common').i18n;

var api = module.exports = {};

api.unsubscribe = function(req, res, next){
  if(!req.query.code) return res.status(500).json({err: 'Missing unsubscription code.'});

  var data = JSON.parse(utils.decrypt(req.query.code));

  if(data._id){
    User.update({_id: data._id}, {
      $set: {'preferences.emailNotifications.unsubscribeFromAll': true}
    }, {multi: false}, function(err, updateRes){
      if(err) return next(err);
      if(updateRes.n !== 1) return res.json(404, {err: 'User not found'});

      res.send('<h1>' + i18n.t('unsubscribedSuccessfully', null, req.language) + '</h1>' + i18n.t('unsubscribedTextUsers', null, req.language));
    });
  }else{
    EmailUnsubscription.findOne({email: data.email}, function(err, doc){
      if(err) return next(err);
      var okRes = '<h1>' + i18n.t('unsubscribedSuccessfully', null, req.language) + '</h1>' + i18n.t('unsubscribedTextOthers', null, req.language);

      if(doc) return res.send(okRes);

      EmailUnsubscription.create({email: data.email}, function(err, doc){
        if(err) return next(err);

        res.send(okRes);
      })
    });
  }
};
