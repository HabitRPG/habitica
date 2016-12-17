export function gems (store) {
  return store.state.user.balance * 4;
}