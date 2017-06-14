export function data (store) {
  return store.state.user.data;
}

export function gems (store) {
  return store.state.user.data.balance * 4;
}