module.exports = function(user, req, cb) {
  var cardType;
  cardType = req.params.cardType;
  user.items.special[cardType + "Received"].shift();
  if (typeof user.markModified === "function") {
    user.markModified("items.special." + cardType + "Received");
  }
  user.flags.cardReceived = false;
  return typeof cb === "function" ? cb(null, 'items.special flags.cardReceived') : void 0;
};
