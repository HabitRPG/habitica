import axios from 'axios';
import * as Analytics from 'client/libs/analytics';

// export async function initQuest (store) {
// }

export async function sendAction (store, payload) {
  Analytics.updateUser({
    partyID: store.state.party.data._id,
    partySize: store.state.party.data.memberCount,
  });

  let response = await axios.post(`/api/v3/groups/${payload.groupId}/${payload.action}`);

  // @TODO: Update user?
  //  User.sync();

  return response.data.quest || response.data.data;
}
