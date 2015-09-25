import gulp from 'gulp';
import eslint from 'gulp-eslint';
import _ from 'lodash';

// TODO remove once we upgrade to lodash 3 
const defaultsDeep = _.partialRight(_.merge, _.defaults);

const shared = {
  rules: {
    indent: [2, 2],
    quotes: [2, 'single'],
    'linebreak-style': [2, 'unix'],
    semi: [2, 'always']
  },
  extends: 'eslint:recommended',
  env: {
    es6: true
  }
};

gulp.task('lint:client', () => {
  // Ignore .coffee files
  return gulp.src(['./website/public/js/**/*.js'])
    .pipe(eslint(defaultsDeep({
      env: {
        node: true
      }
    }, shared)))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:server', () => {
  // Ignore .coffee files
  return gulp.src(['./website/src/**/*.js'])
    .pipe(eslint(defaultsDeep({
      env: {
        browser: true
      }
    }, shared)))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:server', 'lint:client']);