module.exports = function(grunt) {

  grunt.initConfig({
    concat_css: {
      options: {
        // Task-specific options go here.
      },
      all: {
        src: ["css/*.css"],
        dest: "spritesheets.css"
      }
    },

    browserify: {
      all: {
        src: ["script/index.js"],
        dest: "dist/habitrpg-shared.js"
      },
      options: {
        transform: ['coffeeify'],
        debug: true
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['concat_css', 'browserify']);

};