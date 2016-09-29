import Vue from 'vue';

export function setTitle (store, title) {
  store.commit('SET_TITLE', title);
}

export function fetchUser (store) {
  let promise = Vue.http.get('/api/v3/user');

  promise.then(response => {
    store.commit('SET_USER', response.body.data);
  });

  return promise;
}