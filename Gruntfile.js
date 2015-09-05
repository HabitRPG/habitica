/*global module:false*/
var _ = require('lodash');
module.exports = function(grunt) {

  // Ported from shared
  // So this sucks. Mobile Safari can't render image files > 1024x1024*3, so we have to break it down to multiple
  // files in this hack approach. See https://github.com/Ensighten/grunt-spritesmith/issues/67#issuecomment-34786248
  var images = grunt.file.expand('common/img/sprites/spritesmith/**/*.png');
//  var totalDims = {width:0,height:0};
//  _.each(images, function(img){
//    var dims = sizeOf(img);
//    if(!dims.width || !dims.height) console.log(dims);
//    totalDims.width += dims.width;
//    totalDims.height += dims.height;
//  })
  var COUNT = 7;//Math.ceil( (totalDims.width * totalDims.height) / (1024*1024*3) );
  //console.log({totalDims:totalDims,COUNT:COUNT});

  var sprite = {};
  _.times(COUNT, function(i){
    var sliced = images.slice(i * (images.length/COUNT), (i+1) * images.length/COUNT)
    sprite[''+i] = {
      src: sliced,
      dest: 'common/dist/sprites/spritesmith'+i+'.png',
      destCss: 'common/dist/sprites/spritesmith'+i+'.css',
      engine: 'phantomjssmith',
      algorithm: 'binary-tree',
      padding:1,
      cssTemplate: 'common/css/css.template.mustache',
      cssVarMap: function (sprite) {
        // For hair, skins, beards, etc. we want to output a '.customize-options.WHATEVER' class, which works as a
        // 60x60 image pointing at the proper part of the 90x90 sprite.
        // We set up the custom info here, and the template makes use of it.
        if (sprite.name.match(/hair|skin|beard|mustach|shirt|flower|^headAccessory_special_\w+Ears/) || sprite.name=='head_0') {
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
  });


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
      build: ['website/build'],
      sprite: ['common/dist/sprites']
    },

    sprite: sprite,

    imagemin: {
      spritesmith: {
        options: {
          optimizationLevel: 7
        },
        files: [{
          expand: true,
          flatten: true,
          src: ["common/dist/sprites/*.png"],
          dest: "common/dist/sprites/"
        }]
      }
    },

    cssmin: {
      dist: {
        options: {
          report: 'gzip'
        },
        files:{
          "common/dist/sprites/habitrpg-shared.css": [
            "common/dist/sprites/spritesmith*.css",
            "common/css/backer.css",
            "common/css/Mounts.css",
            "common/css/index.css"
          ]
        }
      }
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
        files: ['website/public/**/*.styl', 'common/script/**/*.coffee', 'common/script/**/*.js'], // 'public/**/*.js' Not needed because not in production
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
  grunt.registerTask('compile:sprites', ['clean:sprite', 'sprite', 'imagemin', 'cssmin']);
  grunt.registerTask('build:prod', ['loadManifestFiles', 'clean:build', 'browserify', 'uglify', 'stylus', 'cssmin', 'copy:build', 'hashres']);
  grunt.registerTask('build:dev', ['browserify', 'stylus']);
  grunt.registerTask('build:test', ['test:prepare:translations', 'build:dev']);

  grunt.registerTask('run:dev', [ 'build:dev', 'concurrent' ]);

  grunt.registerTask('test:prepare:translations', function() {
    require('coffee-script');
    var i18n  = require('./website/src/i18n'),
        fs    = require('fs');
    fs.writeFileSync('test/spec/mocks/translations.js',
      "if(!window.env) window.env = {};\n" +
      "window.env.translations = " + JSON.stringify(i18n.translations['en']) + ';');
  });

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
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-hashres');
  grunt.loadNpmTasks('grunt-karma');

};
