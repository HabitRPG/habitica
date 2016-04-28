import _ from 'lodash';

/*
  Get a random property from an object
  returns random property (the value)
 */

module.exports = function(user, obj, options) {
  var array, rand;
  array = (options != null ? options.key : void 0) ? _.keys(obj) : _.values(obj);
  rand = user.fns.predictableRandom(options != null ? options.seed : void 0);
  array.sort();
  return array[Math.floor(rand * array.length)];
};
