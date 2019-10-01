import values from 'lodash/values';
import keys from 'lodash/keys';

export function trueRandom () {
  return Math.random();
}

// Get a random property from an object
// returns random property (the value)
export default function randomVal (obj, options = {}) {
  let array = options.key ? keys(obj) : values(obj);
  let random = options.predictableRandom || trueRandom();

  array.sort();

  let randomIndex = Math.floor(random * array.length);

  return array[randomIndex];
}