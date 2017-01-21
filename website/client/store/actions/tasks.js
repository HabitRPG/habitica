import axios from 'axios';

export async function fetchUserTasks (store) {
  let response = await axios.get('/api/v3/tasks/user');
  store.state.tasks = response.data.data;
}