exports.algos = require('./algos.coffee');
exports.items = require('./items.coffee');
exports.helpers = require('./helpers.coffee');

var moment = require('moment');
var _ = require('lodash');

try {
    window;
    window.habitrpgShared = exports;
    window._ = _;
    window.moment = moment;
} catch(e) {}