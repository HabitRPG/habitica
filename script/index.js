exports.algos = require('./algos.coffee');
exports.items = require('./items.coffee');
exports.helpers = require('./helpers.coffee');

try {
    window;
    window.habitrpgShared = exports;
} catch(e) {}