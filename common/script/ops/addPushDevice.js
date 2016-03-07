import _ from 'lodash';

module.exports = function(user, req, cb) {
  var i, item, pd;
  if (!user.pushDevices) {
    user.pushDevices = [];
  }
  pd = user.pushDevices;
  item = {
    regId: req.body.regId,
    type: req.body.type
  };
  i = _.findIndex(pd, {
    regId: item.regId
  });
  if (i === -1) {
    pd.push(item);
  }
  return typeof cb === "function" ? cb(null, user.pushDevices) : void 0;
};
