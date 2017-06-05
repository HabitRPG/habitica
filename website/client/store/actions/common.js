import axios from 'axios';
import equipOp from 'common/script/ops/equip';
import hatchOp from 'common/script/ops/hatch';

export function equip (store, params) {
  const user = store.state.user.data;
  equipOp(user, {params});
  axios
    .post(`/api/v3/user/equip/${params.type}/${params.key}`);
    // TODO
    // .then((res) => console.log('equip', res))
    // .catch((err) => console.error('equip', err));
}

export function hatch (store, params) {
  const user = store.state.user.data;
  hatchOp(user, {params});
  axios
    .post(`/api/v3/user/hatch/${params.egg}/${params.hatchingPotion}`);
    // TODO
    // .then((res) => console.log('equip', res))
    // .catch((err) => console.error('equip', err));
}
