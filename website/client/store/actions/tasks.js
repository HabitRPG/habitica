import Vue from 'vue';

export async function fetchUserTasks (store) {
  let response = await Vue.http.get('/api/v3/tasks/user');
  store.state.tasks = response.body.data;
}