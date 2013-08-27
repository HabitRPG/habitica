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
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-concat-css');

  // Default task(s).
  grunt.registerTask('default', ['concat_css']);

};