import equipOp from 'common/script/ops/equip';

export function equip (store, params) {
  equipOp(store.state.user.data, {params});
  store.state.user.data.items.gear.equipped = Object.assign({}, store.state.user.data.items.gear.equipped);
}