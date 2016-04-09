module.exports = function sleep (user, req = {}) {
  user.preferences.sleep = !user.preferences.sleep;

  if (req.v2 === true) {
    return {};
  } else {
    return {
      preferences: {
        sleep: user.preferences.sleep,
      },
    };
  }
};
