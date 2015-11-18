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

gulp.task('lint:tests', () => {
  return gulp
    .src([
      './test/**/*.js',
      // @TODO remove these negations as the test files are cleaned up.
      '!./test/api-legacy/**/*',
      '!./test/common/**/*',
      '!./test/content/**/*',
      '!./test/e2e/**/*',
      '!./test/server_side/**/*',
      '!./test/spec/**/*',
    ])
    .pipe(eslint({
      rules: {
        'no-unused-expressions': 0,
        'mocha/no-exclusive-tests': 2,
        'mocha/no-global-tests': 2,
        'mocha/handle-done-callback': 2,
      },
      globals: {
        'expect': true,
      },
      plugins: [ 'mocha' ],
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:server', 'lint:common']);

gulp.task('lint:watch', () => {
  gulp.watch([
    './website/src/**/*.js',
    './common/script/**/*.js',
    './test/**/*.js',
  ], ['lint']);
});
