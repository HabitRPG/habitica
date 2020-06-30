import { v4 as uuid } from 'uuid';

export function add (store, payload) {
  const notification = { ...payload };
  notification.uuid = uuid();
  store.state.notificationStore.push(notification);
}

export function remove (store, payload) {
  store.state.notificationStore = store.state.notificationStore
    .filter(notification => notification.uuid !== payload.uuid);
}
