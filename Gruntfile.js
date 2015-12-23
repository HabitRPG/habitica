/*global module:false*/
require('babel-core/register');
var _ = require('lodash');
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
    },

    clean: {
      build: ['website/build']
    },

    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files:{
          "common/dist/sprites/habitrpg-shared.css": [
            "common/dist/sprites/spritesmith*.css",
            "common/css/backer.css",
            "common/css/Mounts.css",
            "common/css/index.css"
          ]
        }
      }
    },

    stylus: {
      build: {
        options: {
          compress: false, // AFTER
          'include css': true,
          paths: ['website/public']
        },
        files: {
          'website/build/app.css': ['website/public/css/index.styl'],
          'website/build/static.css': ['website/public/css/static.styl']
        }
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'website/public/', src: 'favicon.ico', dest: 'website/build/'},
          {expand: true, cwd: 'website/public/', src: 'favicon_192x192.png', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/dist/sprites/spritesmith*.png', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/img/sprites/backer-only/*.gif', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/img/sprites/npc_ian.gif', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/img/sprites/quest_burnout.gif', dest: 'website/build/'},
          {expand: true, cwd: 'website/public/', src: 'bower_components/bootstrap/dist/fonts/*', dest: 'website/build/'}
        ]
      }
    },

    // UPDATE IT WHEN YOU ADD SOME FILES NOT ALREADY MATCHED!
    hashres: {
      build: {
        options: {
          fileNameFormat: '${name}-${hash}.${ext}'
        },
        src: [
          'website/build/*.js',
          'website/build/*.css',
          'website/build/favicon.ico',
          'website/build/favicon_192x192.png',
          'website/build/common/dist/sprites/*.png',
          'website/build/common/img/sprites/backer-only/*.gif',
          'website/build/common/img/sprites/npc_ian.gif',
          'website/build/common/img/sprites/quest_burnout.gif',
          'website/build/bower_components/bootstrap/dist/fonts/*'
        ],
        dest: 'website/build/*.css'
      }
    }
  });

  //Load build files from public/manifest.json
  grunt.registerTask('loadManifestFiles', 'Load all build files from public/manifest.json', function(){
    var files = grunt.file.readJSON('./website/public/manifest.json');
    var uglify = {};
    var cssmin = {};

    _.each(files, function(val, key){

      var js = uglify['website/build/' + key + '.js'] = [];

      _.each(files[key].js, function(val){
        var path = "./";
        if( val.indexOf('common/') == -1)
          path = './website/public/';
        js.push(path + val);
      });

      var css = cssmin['website/build/' + key + '.css'] = [];

      _.each(files[key].css, function(val){
        var path = "./";
        if( val.indexOf('common/') == -1) {
          path = (val == 'app.css' || val == 'static.css') ?  './website/build/' : './website/public/';
        }
        css.push(path + val)
      });

    });

    grunt.config.set('uglify.build.files', uglify);
    grunt.config.set('uglify.build.options', {compress: false});

    grunt.config.set('cssmin.build.files', cssmin);
    // Rewrite urls to relative path
    grunt.config.set('cssmin.build.options', {'target': 'website/public/css/whatever-css.css'});
  });

  // Register tasks.
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['cssmin', 'stylus']);
  grunt.registerTask('build:test', ['test:prepare:translations', 'build:dev']);

  grunt.registerTask('test:prepare:translations', function() {
    var i18n  = require('./website/src/libs/i18n'),
        fs    = require('fs');
    fs.writeFileSync('test/spec/mocks/translations.js',
      "if(!window.env) window.env = {};\n" +
      "window.env.translations = " + JSON.stringify(i18n.translations['en']) + ';');
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-karma');

};
