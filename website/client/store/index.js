import * as actions from './actions';

const state = {
  title: 'Habitica',
  user: {},
};

const store = {
  state,
  actions,
  dispatch (type, payload) {
    let action = actions[type];

    if (!action) throw new Error(`Action "${type}" not found.`);
    return action(store, payload);
  },
};

export default store;