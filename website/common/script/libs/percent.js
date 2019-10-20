// TODO move to client

export default function percent (x, y, dir) {
  let roundFn;
  switch (dir) {
    case 'up':
      roundFn = Math.ceil;
      break;
    case 'down':
      roundFn = Math.floor;
      break;
    default:
      roundFn = Math.round;
  }
  if (x === 0) {
    x = 1; // eslint-disable-line no-param-reassign
  }
  return Math.max(0, roundFn((x / y) * 100));
}
