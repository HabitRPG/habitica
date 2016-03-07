module.exports = function readCard (user, req, cb) {
  let cardType = req.params.cardType;
  user.items.special[`${cardType}Received`].shift();
  if (user.markModified) {
    user.markModified(`items.special.${cardType}Received`);
  }
  user.flags.cardReceived = false;
  if (cb) cb(null, 'items.special flags.cardReceived');
};
