module.exports = function(grunt) {

  var timestamp = +new Date;

  grunt.initConfig({

    // Cleanup previous spritesmith files
    clean: {
      main: ['dist/spritesmith.png']
    },

    /**
     * Converts our individual image files in img/spritesmith into a unified spritesheet.
     * Note - we do two passes. One for `.customize-options.WHATEVER` for /#/options/profile/avatar, which converts
     * skins, hair, beards, etc. into 60x60 re-positioned buttons. Then we do another pass for everything (which
     * is 90x90 in the case of avatar sprites). This seems wrong to me, but it seems to works. FIXME
     */
    sprite:{
      customizer: {
        src: 'img/sprites/spritesmith/**/*.png',
        destImg: 'dist/spritesmith.png',
        destCSS: 'dist/customizer.css',
        algorithm: 'binary-tree',
        padding:1,
        cssTemplate: 'css/css.template.mustache',
        cssVarMap: function (sprite) {
          // `sprite` has `name`, `image` (full path), `x`, `y`
          //   `width`, `height`, `total_width`, `total_height`
          // EXAMPLE: Prefix all sprite names with 'sprite-'
          if (sprite.name.match(/hair|skin|beard|mustach|shirt|flower/) || sprite.name=='head_0') {
            sprite.name = 'customize-option.' + sprite.name;
            sprite.x = sprite.x + 25;
            sprite.y = sprite.y + 15;
            sprite.width = 60;
            sprite.height = 60;
          }
          if (~sprite.name.indexOf('shirt'))
            sprite.y = sprite.y+15; // even more for shirts
        }
        /*,cssOpts: {
          cssClass: function (item) {
            return '.' + item.name;
          }
        }*/
      },
      main: {
        src: 'img/sprites/spritesmith/**/*.png',
        destImg: 'dist/spritesmith.png',
        destCSS: 'dist/spritesmith.css',
        algorithm: 'binary-tree',
        padding:1,
        cssTemplate: 'css/css.template.mustache'
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
            "dist/customizer.css",
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