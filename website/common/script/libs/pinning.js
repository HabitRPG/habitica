const api = {};

api.getItemPathFromPinKey = function getItemPathFromPinKey (pinKey) {
  const index = pinKey.indexOf('!');
  if (index === -1) {
    return pinKey;
  } else {
    return pinKey.substring(index + 1);
  }
};

api.getCategoryFromPinKey = function getItemPathFromPinKey (pinKey) {
  return pinKey;
};

module.exports = api;