import axios from 'axios';
// export async function initQuest (store) {
// }

export async function sendAction (store, payload) {
  // Analytics.updateUser({
  //   partyID: party._id,
  //   partySize: party.memberCount
  // });
  let response = await axios.post(`/api/v3/groups/${payload.groupId}/${payload.action}`);

  // @TODO: Update user?
  //  User.sync();

  return response.data.quest || response.data.data;
}
