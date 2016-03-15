module.exports = function sleep (user) {
  user.preferences.sleep = !user.preferences.sleep;
  return {
    preferences: {
      sleep: user.preferences.sleep,
    },
  };
};
