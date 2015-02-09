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
      build: ['website/build']
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

    browserify: {
      dist: {
        src: ["common/index.js"],
        dest: "common/dist/scripts/habitrpg-shared.js"
      },
      options: {
        transform: ['coffeeify']
        //debug: true Huge data uri source map (400kb!)
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'website/public/', src: 'favicon.ico', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/dist/sprites/spritesmith*.png', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/img/sprites/backer-only/*.gif', dest: 'website/build/'},
          {expand: true, cwd: '', src: 'common/img/sprites/npc_ian.gif', dest: 'website/build/'},
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
          'website/build/common/dist/sprites/*.png',
          'website/build/common/img/sprites/backer-only/*.gif',
          'website/build/common/img/sprites/npc_ian.gif',
          'website/build/bower_components/bootstrap/dist/fonts/*'
        ],
        dest: 'website/build/*.css'
      }
    },

    nodemon: { 
      dev: {
        script: '<%= pkg.main %>'
      }
    },

    watch: {
      dev: {
        files: ['website/public/**/*.styl'], // 'public/**/*.js' Not needed because not in production
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
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'browserify', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['browserify', 'stylus']);

  grunt.registerTask('run:dev', [ 'build:dev', 'concurrent' ]);

  // Load tasks
  grunt.loadNpmTasks('grunt-browserify');
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
