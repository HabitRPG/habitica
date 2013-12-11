module.exports = function(grunt) {

  grunt.initConfig({
    sprite:{
      all: {
        src: 'img/sprites/spritesmith/**/*.png',
        destImg: 'dist/spritesmith.png',
        destCSS: 'dist/spritesmith.css',
        algorithm: 'binary-tree',
        cssOpts: {
          'cssClass': function (item) {
//            return '.sprite-' + item.name;
            return '.' + item.name;
          }
        }
      }
    },
    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files: {
          "dist/spritesheets.css": [
            "dist/spritesmith.css",
            "css/backer.css",
            "css/Mounts.css",
            "css/index.css"
          ]
        }
      }
    },

    browserify: {
      dist: {
        src: ["index.js"],
        dest: "dist/habitrpg-shared.js"
      },
      options: {
        transform: ['coffeeify']
        //debug: true Huge data uri source map (400kb!)
      }
    }

  });

  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-contrib-cssmin'); // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['sprite', 'cssmin', 'browserify']);

};