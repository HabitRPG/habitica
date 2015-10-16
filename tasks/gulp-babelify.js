import gulp from 'gulp';
import babel from 'gulp-babel';

const ES2015_SOURCE = 'common/script/src/**/*.js';
const ES2015_DIST = 'common/dist/scripts/';

gulp.task('babel:common', () => {
  return gulp.src(ES2015_SOURCE)
    .pipe(babel())
    .pipe(gulp.dest(ES2015_DIST));
});

gulp.task('babel:common:watch', () => {
  gulp.watch([ES2015_SOURCE], ['babel:common']);
});

