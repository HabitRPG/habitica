import _ from 'lodash';
import predictableRandom from './predictableRandom';

// Get a random property from an object
// returns random property (the value)

module.exports = function randomVal (user, obj, options = {}) {
  let array = options.key ? _.keys(obj) : _.values(obj);
  let rand = predictableRandom(user, options.seed);
  array.sort();
  return array[Math.floor(rand * array.length)];
};
