import gulp from 'gulp';
import eslint from 'gulp-eslint';

// TODO lint client
// TDOO separate linting cong between
// TODO lint gulp tasks, tests, ...?
// TODO what about prefer-const rule?
// TODO remove estraverse dependency once https://github.com/adametry/gulp-eslint/issues/117 sorted out
gulp.task('lint:server', () => {
  return gulp
    .src([
      './website/src/**/api-v3/**/*.js',
      './website/src/models/user.js',
      './website/src/server.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:server']);
