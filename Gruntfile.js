module.exports = function(grunt) {

  grunt.initConfig({
    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files: {
          "dist/spritesheets.css": [
            "css/Mounts.css",
            "css/PetEggs.css",
            "css/player_sprites.css",
            "css/male_sprites.css",
            "css/female_sprites.css",
            "css/shop_sprites.css",
            "css/pet_sprites.css",
            "css/achievements.css",
            "css/backer.css"
          ],
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
        //debug: true Huge data uri source map (400kb!)
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'browserify']);

};