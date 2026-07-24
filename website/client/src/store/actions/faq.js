import axios from 'axios';

export async function getFAQ (store) {
  const currentLocale = store.state.i18n.selectedLanguage.code;

  const url = `/api/v4/faq?platform=web&language=${currentLocale}`;
  const response = await axios.get(url);
  return response.data.data;
}
