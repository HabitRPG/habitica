import Vue from 'vue';

const actions = {};

actions.fetch = function fetchUser (store) {
  let promise = Vue.http.get('/api/v3/user');

  promise.then((response) => {
    store.state.user = response.body.data;
  });

  return promise;
};

export default actions;