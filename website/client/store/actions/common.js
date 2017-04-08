import axios from 'axios';
import equipOp from 'common/script/ops/equip';

export function equip (store, params) {
  const user = store.state.user.data;
  equipOp(user, {params});
  user.items.gear.equipped = Object.assign({}, user.items.gear.equipped);
  // Kickstart HTTP request in the background
  axios
    .post(`/api/v3/user/equip/${params.type}/${params.key}`);
    // .then((res) => console.log('equip', res))
    // .catch((err) => console.error('equip', err));
}