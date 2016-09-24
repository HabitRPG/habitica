import _ from 'lodash';

// Get a random property from an object
// returns random property (the value)

function randomGenerator (user, seed, providedRandom) {
  return providedRandom ? providedRandom(user, seed) : Math.random();
}

module.exports = function randomVal (user, obj, options = {}) {
  let array = options.key ? _.keys(obj) : _.values(obj);
  let rand = randomGenerator(user, options.seed, options.randomFunc);
  array.sort();
  return array[Math.floor(rand * array.length)];
};
