import gulp from 'gulp';

let rimraf = require('rimraf');

gulp.task('clean', (cb) => {
  rimraf('website/build', cb);
});
