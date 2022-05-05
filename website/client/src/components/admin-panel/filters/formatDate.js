import moment from 'moment';

export default function formatDate (inputDate) {
  if (!inputDate) return '';
  const date = moment(inputDate).utcOffset(0).format('YYYY-MM-DD HH:mm');
  return `${date} UTC`;
}
