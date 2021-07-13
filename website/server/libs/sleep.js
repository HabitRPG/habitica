import { sleepAsync } from '../../common/script/libs/sleepAsync';

export default async function (seconds = 1) {
  const milliseconds = seconds * 1000;

  return sleepAsync(milliseconds);
}
