import axios from 'axios';

export async function getFAQ () {
  const url = '/api/v4/faq?platform=web';
  const response = await axios.get(url);
  return response.data.data;
}
