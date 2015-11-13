module.exports = require('./script/index');
var _ = require('lodash');
var moment = require('moment');

if (typeof window !== 'undefined') {
  window.habitrpgShared = module.exports;
  window._ = _;
  window.moment = moment;
}
