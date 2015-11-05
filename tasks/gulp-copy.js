import gulp from 'gulp';
import merge from 'merge-stream';

gulp.task('copy', () => {
  let favicon = gulp.src('website/public/favicon.ico').pipe(gulp.dest('website/build'));
  
  let sprites = gulp.src(['common/dist/sprites/spritesmith*.png', 'common/img/sprites/backer-only/*.gif', 'common/img/sprites/npc_ian.gif', 'common/img/sprites/quest_burnout.gif'], {
    base: './'
  }).pipe(gulp.dest('website/build'));

  let bower_components = gulp.src(['website/public/bower_components/bootstrap/dist/fonts/*'], {
    base: './website/public'
  }).pipe(gulp.dest('website/build'));

  return merge(favicon, sprites, bower_components);
})
