import Vue from 'vue';

const actions = {};

actions.fetchUserTasks = function fetchUserTasks (store) {
  let promise = Vue.http.get('/api/v3/tasks/user');

  promise.then((response) => {
    store.state.tasks = response.body.data;
  });

  return promise;
};

export default actions;
