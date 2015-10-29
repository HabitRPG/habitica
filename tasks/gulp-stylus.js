import gulp from 'gulp';

let stylus = require('gulp-stylus');
let nib = require('nib');
let rename = require("gulp-rename");
let merge = require('merge-stream');

gulp.task('stylus', () => {
  let stylusOptions = {
    compress: false,
    use: nib(),
    'include css': true

  };
  let indexStylus = gulp.src('website/public/css/index.styl')
    .pipe(stylus(stylusOptions))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('website/build'));

  let staticStylus = gulp.src('website/public/css/static.styl')
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest('website/build'));

  return merge(indexStylus, staticStylus);
});
