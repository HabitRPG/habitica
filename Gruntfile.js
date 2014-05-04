module.exports = function(grunt) {

  var timestamp = +new Date;

  grunt.initConfig({

    // Cleanup previous spritesmith files
    clean: {
      main: ['dist/spritesmith.png']
    },

    /**
     * Converts our individual image files in img/spritesmith into a unified spritesheet.
     */
    sprite:{
      main: {
        src: 'img/sprites/spritesmith/**/*.png',
        destImg: 'dist/spritesmith.png',
        destCSS: 'dist/spritesmith.css',
        algorithm: 'binary-tree',
        padding:1,
        cssTemplate: 'css/css.template.mustache',
        cssVarMap: function (sprite) {
          // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class, which works as a
          // 60x60 image pointing at the proper part of the 90x90 sprite.
          // We set up the custom info here, and the template makes use of it.
          if (sprite.name.match(/hair|skin|beard|mustach|shirt|flower/) || sprite.name=='head_0') {
            sprite.custom = {
              px: {
                offset_x: "-" + (sprite.x + 25) + "px",
                offset_y: "-" + (sprite.y + 15) + "px",
                width: "" + 60 + "px",
                height: "" + 60 + "px"
              }
            }
          }
          if (~sprite.name.indexOf('shirt'))
            sprite.custom.px.offset_y = "-" + (sprite.y + 30) + "px"; // even more for shirts
        }
        /*,cssOpts: {
          cssClass: function (item) {
            return '.' + item.name; //'.sprite-' + item.name;
          }
        }*/
      }
    },

    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files:{
          "dist/habitrpg-shared.css": [
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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-contrib-cssmin'); // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'browserify']);
  grunt.registerTask('full', ['clean', 'sprite', 'cssmin', 'browserify']);

};