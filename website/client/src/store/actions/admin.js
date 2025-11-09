import axios from 'axios';

export async function searchUsers (store, payload) {
  const url = `/api/v4/admin/search/${payload.userIdentifier}`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function getUserHistory (store, payload) {
  const url = `/api/v4/admin/user/${payload.userIdentifier}/history`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function getSubscriptionPaymentDetails (store, payload) {
  const url = `/api/v4/admin/user/${payload.userIdentifier}/subscription-payment-details`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function getGroup (store, payload) {
  const url = `/api/v4/admin/groups/${payload.groupId}`;
  const response = await axios.get(url);
  return response.data.data;
}

export async function updateGroup (store, payload) {
  const url = `/api/v4/admin/groups/${payload.groupId || payload.group._id}`;
  const response = await axios.put(url, payload.group);
  return response.data.data;
}
