var mongoose = require("mongoose");
var shared = require('../../../common');

var EmailUnsubscriptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    'default': shared.uuid
  },
  email: String
});

module.exports.schema = EmailUnsubscriptionSchema;
module.exports.model = mongoose.model('EmailUnsubscription', EmailUnsubscriptionSchema);