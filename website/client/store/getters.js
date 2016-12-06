export function userGems (store) {
  return store.state.user.balance * 4;
}