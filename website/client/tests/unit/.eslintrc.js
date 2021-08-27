/* eslint-disable import/no-commonjs */
const base = require('../../../../test/.eslintrc.js');

base.rules = base.rules || {};

// TODO find a way to let eslint understand webpack aliases
base.rules['import/no-unresolved'] = 'off';
base.rules['import/extensions'] = 'off';

module.exports = base;
