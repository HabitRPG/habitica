module.exports.items = require('./script/items.coffee');
module.exports.helpers = require('./script/helpers.coffee');
module.exports.algos = require('./script/algos.coffee');

try {
    window;
    window.habitrpgShared = exports;
} catch(e) {}