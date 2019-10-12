const base = require('../../../../test/.eslintrc.js');

// TODO find a way to let eslint understand webpack aliases
base.rules['import/no-unresolved'] = 'off';

module.exports = base;
