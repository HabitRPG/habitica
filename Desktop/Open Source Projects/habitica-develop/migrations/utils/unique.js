'use strict';

function unique (array) {
  return Array.from(new Set(array));
}

module.exports = unique;
