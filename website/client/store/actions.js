import Vue from 'vue';

export function setTitle (store, title) {
  store.state.title = title;
}

export function fetchUser (store) {
  let promise = Vue.http.get('/api/v3/user');

  promise.then(response => {
    store.state.user = response.body.data;
  });

  return promise;
}