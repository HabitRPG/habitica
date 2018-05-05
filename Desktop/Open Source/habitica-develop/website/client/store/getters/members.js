export function isBuffed () {
  return (member) => {
    const buffs = member.stats.buffs;
    return buffs.str || buffs.per || buffs.con || buffs.int;
  };
}

export function hasClass () {
  return (member) => {
    return member.stats.lvl >= 10 && !member.preferences.disableClasses;
  };
}