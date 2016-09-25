import _ from 'lodash';

// Get a random property from an object
// returns random property (the value)

function randomGenerator (user, seed, providedRandom) {
  return providedRandom ? providedRandom(user, seed) : Math.random();
}

module.exports = function randomVal (obj, options = {}) {
  let array = options.key ? _.keys(obj) : _.values(obj);
  let rand = randomGenerator(options.user, options.seed, options.randomFunc);

  array.sort();

  let randomIndex = Math.floor(rand * array.length);

  return array[randomIndex];
};
