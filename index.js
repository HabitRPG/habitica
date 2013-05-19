exports.algos = require('./script/algos')
exports.items = require('./script/items')
exports.helpers = require('./script/helpers')

try {
    window;
    window.habitrpgShared = exports;
} catch(e) {}