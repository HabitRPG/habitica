var mongoose = require("mongoose");
var shared = require('../../../common');

// A collection used to store mailing list unsubscription for non registered email addresses
var EmailUnsubscriptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    'default': shared.uuid
  },
  email: String
});

module.exports.schema = EmailUnsubscriptionSchema;
module.exports.model = mongoose.model('EmailUnsubscription', EmailUnsubscriptionSchema);