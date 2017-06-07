import axios from 'axios';
// import omit from 'lodash/omit';
// import findIndex from 'lodash/findIndex';

export async function getGroupMembers (store, payload) {
  let url = `/api/v3/groups/${payload.groupId}/members`;
  if (payload.includeAllPublicFields) {
    url += '?includeAllPublicFields=true';
  }
  let response = await axios.get(url);
  return response.data.data;
}
