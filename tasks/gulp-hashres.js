import gulp from 'gulp';
let rev = require('gulp-rev');

gulp.task('hashres', () => {
  return gulp.src([
    'website/build/*.js',
    'website/build/*.css',
    'website/build/favicon.ico',
    'website/build/common/dist/sprites/*.png',
    'website/build/common/img/sprites/backer-only/*.gif',
    'website/build/common/img/sprites/npc_ian.gif',
    'website/build/common/img/sprites/quest_burnout.gif',
    'website/build/bower_components/bootstrap/dist/fonts/*'
  ], {base: './website/build'})
  .pipe(rev())
  .pipe(gulp.dest('./website/build'));
});
