import _ from 'lodash';

function trueRandom () {
  return Math.random();
}

// Get a random property from an object
// returns random property (the value)
module.exports = function randomVal (obj, options = {}) {
  let array = options.key ? _.keys(obj) : _.values(obj);
  let random = options.predictableRandom || trueRandom();

  array.sort();

  let randomIndex = Math.floor(random * array.length);

  return array[randomIndex];
};
