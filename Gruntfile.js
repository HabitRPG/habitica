module.exports = function(grunt) {

  grunt.initConfig({
    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files: {
          "dist/spritesheets.css": ["css/*.css"],
        }
      }
    },

    browserify: {
      dist: {
        src: ["script/index.js"],
        dest: "dist/habitrpg-shared.js"
      },
      options: {
        transform: ['coffeeify'],
        //debug: true ENORMEOUS DATA URI SOURCE MAP
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'browserify']);

};