var gulp        = require('gulp'),
    _           = require('lodash'),
    glob        = require('glob'),
    browserify  = require('browserify'),
    coffeeify   = require('coffeeify'),
    source      = require('vinyl-source-stream');
    transform   = require('vinyl-transform'),
    rimraf      = require('rimraf'),
    nodemon     = require('gulp-nodemon'),
    karma       = require('karma').server,
    stylus      = require('gulp-stylus'),
    nib         = require('nib'),
    minifycss   = require('gulp-minify-css'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    csso        = require('gulp-csso'),
    cssmin      = require('gulp-cssmin'),
    config      = require('./website/config'),
    pkg         = require('./package');

var paths = {
  build: {
    css: {},
    js: {},
    dest: "./website/build"
  },
  stylus: {
     src: {
       app: './website/public/css/index.styl',
       staticPage: './website/public/css/static.styl' // static is a 'future' reserved word
     },
     dest: './website/build/',
     watch: './website/public/css/*.styl'
  },
  common: {
    src: ['./common/index.js'],
    dest: './common/dist/scripts/',
    watch: ['./common/*.js', './common/script/*.coffee']
  },
  sprites: {
    src: './common/img/sprites/spritesmith/**/*.png',
    dest: './common/dist/sprites/',
    cssminSrc: ['./common/dist/sprites/spritesmith*.css',
                './common/css/backer.css',
                './common/css/Mounts.css',
                './common/css/index.css'],
    cssminDest: './common/dist/sprites/'
  },
  copy: {
    src: ['./common/img/sprites/backer-only/*.gif', 
      './common/img/sprites/npc_ian.gif',
      './bower_components/bootstrap/dist/fonts/*'],
    dest: './build/'
  },
  hashres: {
    fileNameFormat: '${name}-${hash}.${ext}',
    src: [
      'website/build/*.js', 'website/build/*.css', 'website/build/favicon.ico',
      'common/dist/sprites/*.png',
      'common/img/sprites/backer-only/*.gif',
      'common/img/sprites/npc_ian.gif',
      'website/public/bower_components/bootstrap/dist/fonts/*'
    ],
    dest: 'build/*.css'
  }
};

gulp.task('karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('git_changelog', function() {
  // @TODO: Finish this
});

gulp.task('clean', function(cb) {
  rimraf('./webiste/build', cb);
});

gulp.task('stylus', function() {
  gulp.src(paths.stylus.src.app)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('app.css'))
    .pipe(gulp.dest(paths.stylus.dest));
  gulp.src(paths.stylus.src.staticPage)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('static.css'))
    .pipe(gulp.dest(paths.stylus.dest));
});

gulp.task('copy', function() {
  gulp.src(paths.copy.src)
    .pipe(gulp.dest(paths.copy.dest));
});

gulp.task('hashres', function() {
  // @TODO: Finish this
});

gulp.task('sprite', function(cb) {
  console.log('Cleaning sprites directory...');
  rimraf.sync('./common/dist/sprites');
  // Mobile Safari can't render image files > 1024x1024*3, so we have to break it down to multiple
  // files in this hack approach. See https://github.com/Ensighten/grunt-spritesmith/issues/67#issuecomment-34786248
  var images = glob.sync('./common/img/sprites/spritesmith/**/*.png');
//  var totalDims = {width:0,height:0};
//  _.each(images, function(img){
//    var dims = sizeOf(img);
//    if(!dims.width || !dims.height) console.log(dims);
//    totalDims.width += dims.width;
//    totalDims.height += dims.height;
//  })
  var COUNT = 6;//Math.ceil( (totalDims.width * totalDims.height) / (1024*1024*3) );
  var STEP = 0;
  //console.log({totalDims:totalDims,COUNT:COUNT});

  var sprite = {};
  _.times(COUNT, function(i){
    sprite[''+i] = {
      slice: images.slice(i * (images.length/COUNT), (i+1) * images.length/COUNT),
      imgName: 'spritesmith'+i+'.png',
      cssName: 'spritesmith'+i+'.css',
      engine: 'phantomjssmith',
      algorithm: 'binary-tree',
      padding:1,
      cssTemplate: './common/css/css.template.mustache',
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
  })

  _.forIn(sprite, function(value, key){
      console.log("Starting spritesmith" + key + ".png");
      var spriteData = gulp.src(sprite[key].slice).pipe(spritesmith(sprite[key]));

      spriteData.img
        //.pipe(imagemin())
        .pipe(gulp.dest(paths.sprites.dest));

      // Pipe CSS stream through CSS optimizer and onto disk
      spriteData.css
        .pipe(csso())
        .pipe(gulp.dest(paths.sprites.dest))
        .on('end', function(){
          STEP++;
          console.log("Finished spritesmith" + key + ".png");
          if(STEP >= COUNT) {
            gulp.src(paths.sprites.cssminSrc)
              .pipe(concat('habitrpg-shared.css'))
              .pipe(cssmin())
              .pipe(gulp.dest(paths.sprites.cssminDest))
              .on('end', function(){cb()});
          }
        });
  });
});

gulp.task('browserify', function() {
  var bundleStream = browserify(paths.common.src)
        .transform(coffeeify)
        .bundle()
 
  bundleStream
    .pipe(source('habitrpg-shared.js'))
    .pipe(gulp.dest(paths.common.dest))
})

gulp.task('loadManifest', function(cb) {

  var files = require('./website/public/manifest');
  var j = paths.build.js;
  var c = paths.build.css;

  _.each(files, function(val, key){

    var js = j[key + '.js'] = [];

    _.each(files[key].js, function(val){
      js.push('./website/public/' + val);
    });

    var css = c[key + '.css'] = [];

    _.each(files[key].css, function(val){
      var path = (val == 'app.css' || val == 'static.css') ?  paths.build.dest : './website/public/';
      css.push(path + val)
    });

  });
  cb();
});

gulp.task('build:css', function() {

  var c = paths.build.css;
  // Concat CSS
  _.each(c, function(val, key) {
    gulp.src(val)
      .pipe(concat(key))
      .pipe(cssmin())
      .pipe(gulp.dest(paths.build.dest))
  });
});

gulp.task('build:js', function() {

  var j = paths.build.js;
  // Uglify JS
  _.each(j, function(val, key) {
    gulp.src(val)
      .pipe(concat(key))
      .pipe(uglify())
      .pipe(gulp.dest(paths.build.dest))
  });
});

gulp.task('build', ['loadManifest', 'clean', 'stylus', 'browserify', 'build:css', 'build:js'], function() {
  
});

gulp.task('watch', ['stylus', 'browserify'], function() {
  gulp.watch(paths.stylus.watch, ['stylus']);
  gulp.watch(paths.common.watch, ['browserify']);
});

gulp.task('dev', ['watch'], function() {
  nodemon({ script: pkg.main });
});

gulp.task('prod', ['build'], function() {
  nodemon({ script: pkg.main });
});

if(config.NODE_ENV == 'development') {
  gulp.task('default', ['dev']);
} else if(config.NODE_ENV == 'production') {
  gulp.task('default', ['prod']);
}
