import gulp from 'gulp';
import browserify from 'browserify';

let source = require('vinyl-source-stream');
let rename = require("gulp-rename");
let minifyCss = require('gulp-minify-css');
let stylus = require('gulp-stylus');
let nib = require('nib');

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  } else {
    gulp.start('build:dev');
  }
});

gulp.task('build:dev', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  let b = browserify({
    entries: ['./common/index.js'],
  });

  b.transform('coffeeify').bundle().pipe(source('index.js')).pipe(rename('habitrpg-shared.js'))
    .pipe(gulp.dest('common/dist/scripts/'));
  
gulp.src(["common/dist/sprites/spritesmith*.css",
          g  "common/css/backer.css",
            "common/css/Mounts.css",
            "common/css/index.css"], {base: 'common/'})
  .pipe(minifyCss({compatibility: 'ie8'}))
  .pipe(rename('habitrpg-shared.css'))
  .pipe(gulp.dest('common/dist/sprites'));

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
});

gulp.task('build:dev:watch', ['build:dev'], () => {
  gulp.watch(['website/public/**/*.styl', 'common/script/*']);
});

gulp.task('build:prod', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  gulp.start('grunt-build:prod', done);
});


