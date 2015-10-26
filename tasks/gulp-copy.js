import gulp from 'gulp';

gulp.task('copy', (cb) => {
	gulp.src('website/public/favicon.ico').pipe(gulp.dest('website/build'));
	gulp.src(['common/dist/sprites/spritesmith*.png', 'common/img/sprites/backer-only/*.gif', 'common/img/sprites/npc_ian.gif', 'common/img/sprites/quest_burnout.gif'], {
		base: './'
	}).pipe(gulp.dest('website/build'));	
	gulp.src(['website/public/bower_components/bootstrap/dist/fonts/*'], {
		base: './website/public'
	}).pipe(gulp.dest('website/build'));
})
