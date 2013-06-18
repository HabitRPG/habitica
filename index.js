module.exports.items = require('./script/items.coffee');
module.exports.algos = require('./script/algos.coffee');
module.exports.helpers = require('./script/helpers.coffee');

try {
    window;
    window.habitrpgShared = exports;
} catch(e) {}