import gulp from 'gulp';
import eslint from 'gulp-eslint';

const SERVER_FILES = [
  './website/src/**/api-v3/**/*.js',
  // Comment these out in develop, uncomment them in api-v3
  // './website/src/models/user.js',
  // './website/src/server.js'
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
  '!./test/common/simulations/**/*',
  '!./test/content/**/*',
  '!./test/server_side/**/*',
  '!./test/spec/**/*',
];

let linter = (src, options) => {
  return gulp
    .src(src)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

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
  return linter(TEST_FILES);
});

gulp.task('lint', ['lint:server', 'lint:common', 'lint:tests']);

gulp.task('lint:watch', () => {
  gulp.watch([
    SERVER_FILES,
    COMMON_FILES,
    TEST_FILES,
  ], ['lint']);
});
