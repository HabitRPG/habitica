import axios from 'axios';
import equipOp from 'common/script/ops/equip';

export function equip (store, params) {
  const user = store.state.user.data;
  equipOp(user, {params});
  axios
    .post(`/api/v3/user/equip/${params.type}/${params.key}`);
    // TODO
    // .then((res) => console.log('equip', res))
    // .catch((err) => console.error('equip', err));
}