import shortid from 'shortid';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ-_');

function generateUsername () {
  return shortid.generate();
}

module.exports = { generateUsername };
