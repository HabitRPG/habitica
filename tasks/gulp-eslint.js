import gulp from 'gulp';
import eslint from 'gulp-eslint';

// TODO lint client
// TDOO separate linting cong between 
gulp.task('lint:server', () => {
  // Ignore .coffee files
  return gulp
    .src(['./website/src/**/api-v3/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:server']);