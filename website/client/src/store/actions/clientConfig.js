import axios from 'axios';

export async function getClientConfigs () {
  const response = await axios.get('/api/v4/admin/client-config');
  return response.data.data;
}
export async function createClientConfig (store, payload) {
  const response = await axios.post('/api/v4/admin/client-config', payload.clientConfig);
  return response.data.data;
}
export async function updateClientConfig (store, payload) {
  const response = await axios.put(`/api/v4/admin/client-config/${payload.clientConfig._id}`, payload.clientConfig);
  return response.data.data;
}

export async function deleteClientConfig (store, payload) {
  const response = await axios.delete(`/api/v4/admin/client-config/${payload.clientConfigId}`);
  return response.data.data;
}

export async function getClientConfigAttributes () {
  const response = await axios.get('/api/v4/admin/client-config-attributes');
  return response.data.data;
}

export async function getClientConfigSegments () {
  const response = await axios.get('/api/v4/admin/client-config-segments');
  return response.data.data;
}

export async function createClientConfigSegment (store, payload) {
  const response = await axios.post('/api/v4/admin/client-config-segments', payload.segment);
  return response.data.data;
}

export async function updateClientConfigSegment (store, payload) {
  const response = await axios.put(`/api/v4/admin/client-config-segments/${payload.segment._id}`, payload.segment);
  return response.data.data;
}

export async function deleteClientConfigSegment (store, payload) {
  const response = await axios.delete(`/api/v4/admin/client-config-segments/${payload.segmentId}`);
  return response.data.data;
}
