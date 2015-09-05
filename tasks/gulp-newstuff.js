import gulp from 'gulp';
import jade from 'jade';
import {writeFileSync} from 'fs';

gulp.task('prepare:staticNewStuff', () => {
  writeFileSync(
    './website/public/new-stuff.html',
    jade.compileFile('./website/views/shared/new-stuff.jade')()
  );
});
