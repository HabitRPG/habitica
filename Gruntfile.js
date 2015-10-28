/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        autoWatch: false
      }
    }
  });
  grunt.registerTask('build:test', ['test:prepare:translations', 'build:dev']);

  grunt.registerTask('test:prepare:translations', function() {
    require('coffee-script');
    var i18n  = require('./website/src/i18n'),
        fs    = require('fs');
    fs.writeFileSync('test/spec/mocks/translations.js',
      "if(!window.env) window.env = {};\n" +
      "window.env.translations = " + JSON.stringify(i18n.translations['en']) + ';');
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-karma');

};
