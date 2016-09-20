import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'babelify';

gulp.task('browserify', function () {
  let bundler = browserify({
    entries: './website/common/browserify.js',
    debug: true,
    transform: [[babel, { compact: false }]],
  });

  return bundler.bundle()
    .pipe(source('habitrpg-shared.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./website/client-old/js/'));
});

gulp.task('browserify:watch', () => {
  gulp.watch('./website/common/script/**/*.js', ['browserify']);
});
