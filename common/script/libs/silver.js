/*
Silver amount from their money
 */

module.exports = function(num) {
  if (num) {
    return ("0" + Math.floor((num - Math.floor(num)) * 100)).slice(-2);
  } else {
    return "00";
  }
};
