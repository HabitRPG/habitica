import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import rename from 'gulp-rename';

gulp.task('browserify', () => {
  let b = browserify({
    entries: ['./common/index.js'],
  });

  return b.transform('coffeeify').bundle()
    .pipe(source('index.js'))
    .pipe(rename('habitrpg-shared.js'))
    .pipe(gulp.dest('common/dist/scripts/'));

});
