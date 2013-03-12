exports.algos = require('./algos')
exports.items = require('./items')
exports.helpers = require('./helpers')

// This is how we're exporting this module to the browser. A preferable way would be http://requirejs.org/docs/api.html#packages
// but I couldn't get that working
if (!!window) window.habitrpgShared = exports;