/*global module:false*/
var _ = require('lodash');
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    git_changelog: {
        minimal: {
            options: {
                repo_url: 'https://github.com/habitrpg/habitrpg',
                appName : 'HabitRPG',
                branch_name: 'develop'
            }
        },
        extended: {
            options: {
                file: 'EXTENDEDCHANGELOG.md',
                repo_url: 'https://github.com/habitrpg/habitrpg',
                appName : 'HabitRPG',
                branch_name: 'develop',
                grep_commits: '^perf|^style|^fix|^feat|^docs|^refactor|^chore|BREAKING'
            }
        }
    },

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
      build: ['build']
    },

    stylus: {
      build: {
        options: {
          compress: false, // AFTER
          'include css': true,
          paths: ['public']
        },
        files: {
          'build/app.css': ['public/css/index.styl'],
          'build/static.css': ['public/css/static.styl']
        }
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'public/', src: 'favicon.ico', dest: 'build/'},
          {expand: true, cwd: 'public/', src: 'bower_components/habitrpg-shared/dist/spritesmith.png', dest: 'build/'},
          {expand: true, cwd: 'public/', src: 'bower_components/habitrpg-shared/img/sprites/backer-only/*.gif', dest: 'build/'},
          {expand: true, cwd: 'public/', src: 'bower_components/habitrpg-shared/img/sprites/npc_ian.gif', dest: 'build/'},
          {expand: true, cwd: 'public/', src: 'bower_components/bootstrap/dist/fonts/*', dest: 'build/'}
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
          'build/*.js', 'build/*.css', 'build/favicon.ico',
          'build/bower_components/habitrpg-shared/dist/*.png',
          'build/bower_components/habitrpg-shared/img/sprites/backer-only/*.gif',
          'build/bower_components/habitrpg-shared/img/sprites/npc_ian.gif',
          'build/bower_components/bootstrap/dist/fonts/*'
        ],
        dest: 'build/*.css'
      }
    },

    nodemon: { 
      dev: {
        script: '<%= pkg.main %>'
      }
    },

    watch: {
      dev: {
        files: ['public/**/*.styl'], // 'public/**/*.js' Not needed because not in production
        tasks:  [ 'build:dev' ],
        options: {
          nospawn: true
        }
      }
    },

    concurrent: {
      dev: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }

  });

  //Load build files from public/manifest.json
  grunt.registerTask('loadManifestFiles', 'Load all build files from public/manifest.json', function(){
    var files = grunt.file.readJSON('./public/manifest.json');
    var uglify = {};
    var cssmin = {};

    _.each(files, function(val, key){

      var js = uglify['build/' + key + '.js'] = [];

      _.each(files[key]['js'], function(val){
        js.push('public/' + val);
      });

      var css = cssmin['build/' + key + '.css'] = [];

      _.each(files[key]['css'], function(val){
        var path = (val == 'app.css' || val == 'static.css') ? 'build/' : 'public/';
        css.push(path + val)
      });

    });

    grunt.config.set('uglify.build.files', uglify);
    grunt.config.set('uglify.build.options', {compress: false});

    grunt.config.set('cssmin.build.files', cssmin);
    // Rewrite urls to relative path
    grunt.config.set('cssmin.build.options', {'target': 'public/css/whatever-css.css'});
  });

  // Register tasks.
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['stylus']);

  grunt.registerTask('run:dev', [ 'build:dev', 'concurrent' ]);

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('git-changelog');

};
