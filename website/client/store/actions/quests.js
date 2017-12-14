import axios from 'axios';
import * as Analytics from 'client/libs/analytics';

// export async function initQuest (store) {
// }

export async function sendAction (store, payload) {
  // @TODO: Maybe move this to server
  let partyData = {
    partyID: store.state.user.data.party._id,
    partySize: store.state.partyMembers.data.length,
  };

  if (store.state.party && store.state.party.data) {
    partyData = {
      partyID: store.state.party.data._id,
      partySize: store.state.party.data.memberCount,
    };
  }

  Analytics.updateUser(partyData);

  let response = await axios.post(`/api/v3/groups/${payload.groupId}/${payload.action}`);

  // @TODO: Update user?
  //  User.sync();

  return response.data.quest || response.data.data;
}
