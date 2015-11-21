import gulp from 'gulp';
import eslint from 'gulp-eslint';

const SERVER_FILES = [
  './website/src/**/api-v3/**/*.js',
  './website/src/models/user.js',
  './website/src/server.js',
];
const COMMON_FILES = [
  './common/script/**/*.js',
  // @TODO remove these negations as the files are converted over.
  '!./common/script/index.js',
  '!./common/script/content/index.js',
  '!./common/script/src/**/*.js',
  '!./common/script/public/**/*.js',
];
const TEST_FILES = [
  './test/**/*.js',
  // @TODO remove these negations as the test files are cleaned up.
  '!./test/api-legacy/**/*',
  '!./test/api/**/*',
  '!./test/common/simulations/**/*',
  '!./test/content/**/*',
  '!./test/e2e/**/*',
  '!./test/server_side/**/*',
  '!./test/spec/**/*',
];

let linter = (src, options) => {
  return gulp
    .src(src)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// TODO lint client
// TDOO separate linting cong between
// TODO lint gulp tasks, tests, ...?
// TODO what about prefer-const rule?
// TODO remove estraverse dependency once https://github.com/adametry/gulp-eslint/issues/117 sorted out
gulp.task('lint:server', () => {
  return linter(SERVER_FILES);
});

gulp.task('lint:common', () => {
  return linter(COMMON_FILES);
});

gulp.task('lint:tests', () => {
  let options = {
    rules: {
      'max-nested-callbacks': 0,
      'no-unused-expressions': 0,
      'mocha/no-exclusive-tests': 2,
      'mocha/no-global-tests': 2,
      'mocha/handle-done-callback': 2,
    },
    globals: {
      'expect': true,
      '_': true,
      'sinon': true,
    },
    plugins: [ 'mocha' ],
  };

  return linter(TEST_FILES, options);
});

gulp.task('lint', ['lint:server', 'lint:common', 'lint:tests']);

gulp.task('lint:watch', () => {
  gulp.watch([
    SERVER_FILES,
    COMMON_FILES,
    TEST_FILES,
  ], ['lint']);
});
