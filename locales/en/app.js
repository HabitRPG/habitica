var _ = require('lodash');

var files = [
  // List of files containing translations
  require('./main.json'),
  require('./secondary.json')
];

module.exports = {};

_.each(files, function(file){
  _.merge(module.exports, file);
});