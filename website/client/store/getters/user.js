export function gems (store) {
  return store.state.user.data.balance * 4;
}

export function isBuffed (store) {
  const buffs = store.state.user.data.stats.buffs;
  return buffs.str || buffs.per || buffs.con || buffs.int;
}