/* eslint-disable no-console */

import gulp from 'gulp';
import path from 'path';
import babel from 'gulp-babel';
import os from 'os';
import fs from 'fs';
import spawn from 'cross-spawn'; // eslint-disable-line import/no-extraneous-dependencies
import clean from 'rimraf';

gulp.task('build:babel:server', () => gulp.src('website/server/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('website/transpiled-babel/')));

gulp.task('build:babel:common', () => gulp.src('website/common/script/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('website/common/transpiled-babel/')));

gulp.task('build:babel', gulp.parallel('build:babel:server', 'build:babel:common', done => done()));

gulp.task('build:cache', gulp.parallel(
  'cache:content',
  'cache:i18n',
  done => done(),
));

gulp.task('build:prod', gulp.series(
  'build:babel',
  'apidoc',
  'build:cache',
  done => done(),
));

// Due to this issue https://github.com/vkarpov15/run-rs/issues/45
// When used on windows `run-rs` must first be run without the `--keep` option
// in order to be setup correctly, afterwards it can be used.

const MONGO_PATH = path.join(__dirname, '/../mongodb-data/');

gulp.task('build:prepare-mongo', async () => {
  if (fs.existsSync(MONGO_PATH)) {
    // console.log('MongoDB data folder exists, skipping setup.');
    return;
  }

  if (os.platform() !== 'win32') {
    // console.log('Not on Windows, skipping MongoDB setup.');
    return;
  }

  console.log('MongoDB data folder is missing, setting up.'); // eslint-disable-line no-console

  // use run-rs without --keep, kill it as soon as the replica set starts
  const runRsProcess = spawn('run-rs', ['-v', '4.2.8', '-l', 'ubuntu1804', '--dbpath', 'mongodb-data', '--number', '1', '--quiet']);

  for await (const chunk of runRsProcess.stdout) {
    const stringChunk = chunk.toString();
    console.log(stringChunk); // eslint-disable-line no-console
    // kills the process after the replica set is setup
    if (stringChunk.includes('Started replica set')) {
      console.log('MongoDB setup correctly.'); // eslint-disable-line no-console
      runRsProcess.kill();
    }
  }

  let error = '';
  for await (const chunk of runRsProcess.stderr) {
    const stringChunk = chunk.toString();
    error += stringChunk;
  }

  const exitCode = await new Promise(resolve => {
    runRsProcess.on('close', resolve);
  });

  if (exitCode || error.length > 0) {
    // remove any leftover files
    clean.sync(MONGO_PATH);

    throw new Error(`Error running run-rs: ${error}`);
  }
});

gulp.task('build:dev', gulp.series(
  'build:prepare-mongo',
  done => done(),
));

const buildArgs = [];

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  buildArgs.push('build:prod');
} else if (process.env.NODE_ENV !== 'test') { // eslint-disable-line no-process-env
  buildArgs.push('build:dev');
}

gulp.task('build', gulp.series(buildArgs, done => {
  done();
}));
