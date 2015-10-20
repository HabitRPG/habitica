var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');

// We don't care about the actual schema, just need to be able to load plain data
var ChallengeSchema = new Schema({
  _id: {type: String, 'default': shared.uuid}
});

module.exports.schema = ChallengeSchema;
module.exports.model = mongoose.model("Challenge", ChallengeSchema);
