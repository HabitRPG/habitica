export function gems (store) {
  return store.state.user.data.balance * 4;
}