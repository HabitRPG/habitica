require('babel-polyfill');

var shared = require('./script/index');
var _ = require('lodash');
var moment = require('moment');

window.habitrpgShared = shared;
window._ = _;
window.moment = moment;
