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
      // Comment these out in develop, uncomment them in api-v3
      // './website/src/models/user.js',
      // './website/src/server.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:common', () => {
  return gulp
    .src([
      './common/script/**/*.js',
      // @TODO remove these negations as the files are converted over.
      '!./common/script/index.js',
      '!./common/script/content/index.js',
      '!./common/script/src/**/*.js',
      '!./common/script/public/**/*.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:server', 'lint:common']);
