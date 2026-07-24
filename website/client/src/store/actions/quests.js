import axios from 'axios';

export async function sendAction (store, payload) { // eslint-disable-line import/prefer-default-export, max-len
  const response = await axios.post(`/api/v4/groups/${payload.groupId}/${payload.action}`);

  // @TODO: Update user?
  //  User.sync();

  return response.data.quest || response.data.data;
}
