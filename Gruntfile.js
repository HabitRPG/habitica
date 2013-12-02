/*global module:false*/
var _ = require('lodash');
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

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
        files: [{expand: true, cwd: 'public/', src: 'favicon.ico', dest: 'build/'}]
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
          'build/bower_components/bootstrap/docs/assets/css/*.css',
          'build/bower_components/habitrpg-shared/dist/*.css'
        ],
        dest: 'make-sure-i-do-not-exist'
      }
    },

    nodemon: {
      dev: {
        ignoredFiles: ['public/*', 'Gruntfile.js', 'views/*', 'build/*']
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
      _.each(files[key]['css'], function(val){
        if(val == 'app.css' || val == 'static.css'){
          cssmin['build/' + val] = ['build/' + val]
        }else{
          cssmin['build/' + val] = ['public/' + val]
        }
      });
    });
    grunt.config.set('uglify.build.files', uglify);
    grunt.config.set('uglify.build.options', {compress: false})
    grunt.config.set('cssmin.build.files', cssmin);
  });

  // Register tasks.
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['loadManifestFiles', 'clean:build', 'stylus', 'cssmin', 'copy:build']);

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

};
