import gulp from 'gulp';
import browserify from 'browserify';
import fs from 'fs';

let source = require('vinyl-source-stream');
let rename = require("gulp-rename");
let minifyCss = require('gulp-minify-css');
let stylus = require('gulp-stylus');
let nib = require('nib');
let _ = require('lodash');
let uglify = require('gulp-uglify');

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  } else {
    gulp.start('build:dev');
  }
});

gulp.task('build:dev', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  doBrowserify();
  doCssmin({
    'common/dist/sprites/habitrpg-shared.css': ["common/dist/sprites/spritesmith*.css",
            "common/css/backer.css",
            "common/css/Mounts.css",
            "common/css/index.css"]
  });
  doStylus();
});

gulp.task('build:dev:watch', ['build:dev'], () => {
  gulp.watch(['website/public/**/*.styl', 'common/script/*']);
});

gulp.task('build:prod', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  var files = JSON.parse(fs.readFileSync('./website/public/manifest.json'));
  var uglifyFiles = {};
  var cssminFiles = {};

  _.each(files, function(val, key) {
    var js = uglifyFiles['website/build/' + key + '.js'] = [];

    _.each(files[key].js, function(val){
      var path = "./";
      if( val.indexOf('common/') == -1)
        path = './website/public/';
      js.push(path + val);
    });

    var css = cssminFiles['website/build/' + key + '.css'] = [];

    _.each(files[key].css, function(val){
      var path = "./";
      if( val.indexOf('common/') == -1) {
        path = (val == 'app.css' || val == 'static.css') ?  './website/build/' : './website/public/';
      }
      css.push(path + val)
    });
  
  });

  doBrowserify();
  doUglify(uglifyFiles);
  doCssmin(cssminFiles);
  doStylus();
  gulp.start('copy');
  gulp.start('hashres');
});


function doBrowserify() {
  let b = browserify({
    entries: ['./common/index.js'],
  });

  b.transform('coffeeify').bundle()
    .pipe(source('index.js'))
    .pipe(rename('habitrpg-shared.js'))
    .pipe(gulp.dest('common/dist/scripts/'));
}

function doCssmin(files) {
  _.each(files, function(val, key) {
    gulp.src(val)
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename(basename(key)))
    .pipe(gulp.dest(dirname(key)));
  });

}

function doUglify(files) {
  _.each(files, function(val, key) {
    gulp.src(val)
    .pipe(uglify({
      compress: false
    }))
    .pipe(rename(basename(key)))
    .pipe(gulp.dest(dirname(key)));
  });
}

function doStylus() {
  let stylusOptions = {
    compress: false,
    use: nib(),
    'include css': true

  };
  gulp.src('website/public/css/index.styl')
    .pipe(stylus(stylusOptions))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('website/build'));

  gulp.src('website/public/css/static.styl')
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest('website/build'));

}

function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

function dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}
