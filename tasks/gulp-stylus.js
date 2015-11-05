import gulp from 'gulp';
import stylus from 'gulp-stylus';
import nib from 'nib';
import rename from 'gulp-rename';
import merge from 'merge-stream';

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
