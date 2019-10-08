// Check if user has Class system enabled
export default function hasClass (member) {
  return (
    member.stats.lvl >= 10
    && !member.preferences.disableClasses
    && member.flags.classSelected
  );
}
