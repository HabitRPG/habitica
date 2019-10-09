export function data (store) {
  return store.state.user.data;
}

export function gems (store) {
  return store.state.user.data.balance * 4;
}

export function buffs (store) {
  return key => store.state.user.data.stats.buffs[key];
}

export function preferences (store) {
  return store.state.user.data.preferences;
}

export function tasksOrder (store) {
  return type => store.state.user.tasksOrder[`${type}s`];
}
