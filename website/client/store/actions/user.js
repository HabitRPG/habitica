import Vue from 'vue';

export async function fetch (store) { // eslint-disable-line no-shadow
  let response = await  Vue.http.get('/api/v3/user');
  store.state.user = response.body.data;
}