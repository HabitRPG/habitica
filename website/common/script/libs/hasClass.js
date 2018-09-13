// Check if user has Class system enabled
module.exports = function hasClass (member) {
  return (
    member.stats.lvl >= 10 &&
    !member.preferences.disableClasses &&
    member.flags.classSelected
  );
};
