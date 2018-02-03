import uuid from 'uuid';

export function add (store, payload) {
  let notification = Object.assign({}, payload);
  notification.uuid = uuid();
  store.state.notificationStore.push(notification);
}

export function remove (store, payload) {
  store.state.notificationStore = store.state.notificationStore.filter(notification => {
    return notification.uuid !== payload.uuid;
  });
}
