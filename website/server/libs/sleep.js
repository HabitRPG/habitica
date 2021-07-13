import common from '../../common';

export default async function (seconds = 1) {
  const milliseconds = seconds * 1000;

  return common.sleepAsync(milliseconds);
}
