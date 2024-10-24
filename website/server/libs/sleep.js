// using import common from '../../common';
// the test:unit can't be compiled
// so the sleepAsync can't be used here (to prevent duplicated code)

function sleep (seconds = 1) {
  const milliseconds = seconds * 1000;

  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

export {
  sleep,
};
