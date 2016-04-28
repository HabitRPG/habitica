module.exports = function(x, y, dir) {
  var roundFn;
  switch (dir) {
    case "up":
      roundFn = Math.ceil;
      break;
    case "down":
      roundFn = Math.floor;
      break;
    default:
      roundFn = Math.round;
  }
  if (x === 0) {
    x = 1;
  }
  return Math.max(0, roundFn(x / y * 100));
};
