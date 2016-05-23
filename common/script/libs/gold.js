// TODO move to client

module.exports = function gold (num) {
  if (num) {
    return Math.floor(num);
  } else {
    return '0';
  }
};
