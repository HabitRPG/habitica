import gulp from 'gulp';

import rimraf from 'rimraf';

gulp.task('clean', (cb) => {
  rimraf('website/build', cb);
});
