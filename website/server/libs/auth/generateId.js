import shortid from 'short-uuid';

const translator = shortid('0123456789abcdefghijklmnopqrstuvwxyz');

function generateUsername () {
  return `hb-${translator.new()}`;
}

module.exports = { generateUsername };
