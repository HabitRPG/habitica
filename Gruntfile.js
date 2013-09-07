/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      build: ['public/build']
    },

    uglify: {
      buildApp: {
        files: {
          'public/build/app.js': [
            'public/bower_components/jquery/jquery.min.js',
            'public/bower_components/bootstrap-growl/jquery.bootstrap-growl.min.js',
            'public/bower_components/angular/angular.min.js',
            'public/bower_components/angular-sanitize/angular-sanitize.min.js',
            'public/bower_components/angular-route/angular-route.min.js',
            'public/bower_components/angular-resource/angular-resource.min.js',
            'public/bower_components/angular-ui/build/angular-ui.min.js',
            'public/bower_components/angular-ui-utils/modules/keypress/keypress.js',
            // we'll remove this once angular-bootstrap is fixed
            'public/bower_components/bootstrap/docs/assets/js/bootstrap.min.js',
            'public/bower_components/angular-bootstrap/ui-bootstrap.min.js',
            'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            // Sortable
            'public/bower_components/jquery-ui/ui/minified/jquery.ui.core.min.js',
            'public/bower_components/jquery-ui/ui/minified/jquery.ui.widget.min.js',
            'public/bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min.js',
            'public/bower_components/jquery-ui/ui/minified/jquery.ui.sortable.min.js',
            // habitrpg-shared
            'public/bower_components/habitrpg-shared/dist/habitrpg-shared.js',
            // app
            'public/js/app.js',
            'public/js/services/authServices.js',
            'public/js/services/notificationServices.js',
            'public/js/services/sharedServices.js',
            'public/js/services/userServices.js',
            'public/js/services/groupServices.js',

            'public/js/filters/filters.js',

            'public/js/directives/directives.js',

            'public/js/controllers/authCtrl.js',
            'public/js/controllers/characterCtrl.js',
            'public/js/controllers/menuCtrl.js',
            'public/js/controllers/notificationCtrl.js',
            'public/js/controllers/rootCtrl.js',
            'public/js/controllers/settingsCtrl.js',
            'public/js/controllers/statsCtrl.js',
            'public/js/controllers/tasksCtrl.js',
            'public/js/controllers/taskDetailsCtrl.js',
            'public/js/controllers/filtersCtrl.js',
            'public/js/controllers/userAvatarCtrl.js',
            'public/js/controllers/groupsCtrl.js',
            'public/js/controllers/petsCtrl.js',
            'public/js/controllers/inventoryCtrl.js',
            'public/js/controllers/marketCtrl.js',
            'public/js/controllers/footerCtrl.js'
          ]
        }
      },
      buildStatic: {
        files: {
          'public/build/static.js': [
            'public/bower_components/jquery/jquery.min.js',
            'public/bower_components/habitrpg-shared/dist/habitrpg-shared.js',
            'public/bower_components/angular/angular.min.js',
            'public/bower_components/bootstrap/docs/assets/js/bootstrap.min.js',

            'public/js/static.js',
            'public/js/services/userServices.js',
            'public/js/controllers/authCtrl.js'
          ]
        }
      }
    },

    stylus: {
      build: {
        options: {
          compress: false, // AFTER
          'include css': true,
          paths: ['public']
        },
        files: {
          'public/build/app.css': ['public/css/index.styl'],
          'public/build/static.css': ['public/css/static.styl']
        }
      }
    },

    cssmin: {
      build: {
        files: {
          'public/build/app.css': ['public/build/app.css'],
          'public/build/static.css': ['public/build/static.css']
        }
      }
    },

    exec: {
      start: {
        cmd: function(mode){
          if(mode && mode == 'production'){
            return 'nodemon --exec "./start.sh" production'
          }else{
            return 'nodemon --exec "./start.sh"'
          }
        }
      }
    }

    /*hashres: {
      options: {
        fileNameFormat: '${name}-${hash}.${ext}',
      },
      build: {
        src: [
          'public/build/app.js',
          'public/build/static.js'
        ],
        dest: 'views/i-do-not-exist.jade' // Non existing file!
      }
    }*/

  });

  // Register tasks.
  grunt.registerTask('production', ['clean:build', 'uglify', 'stylus', 'cssmin']);
  grunt.registerTask('development', ['clean:build', 'stylus', 'cssmin']);
  grunt.registerTask('start:production', ['exec:start:production']);
  grunt.registerTask('start', ['exec:start']);

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-exec');

};
