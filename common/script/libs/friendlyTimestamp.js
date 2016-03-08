import moment from 'moment';

/*
Friendly timestamp
 */

module.exports = function(timestamp) {
  return moment(timestamp).format('MM/DD h:mm:ss a');
};
