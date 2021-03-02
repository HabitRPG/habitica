import mongoose from 'mongoose';
import { exec } from 'child_process';
import gulp from 'gulp';
import os from 'os';
import nconf from 'nconf';
import { pipe } from './taskHelper';
import {
  getDevelopmentConnectionUrl,
  getDefaultConnectionOptions,
} from '../website/server/libs/mongodb';

// TODO rewrite

const TEST_SERVER_PORT = 3003;
let server;

const TEST_DB_URI = nconf.get('TEST_DB_URI');

const SANITY_TEST_COMMAND = 'npm run test:sanity';
const COMMON_TEST_COMMAND = 'npm run test:common';
const CONTENT_TEST_COMMAND = 'npm run test:content';
const LIMIT_MAX_BUFFER_OPTIONS = { maxBuffer: 1024 * 500 };

/* Helper method for reporting test summary */
const testResults = [];
const testCount = (stdout, regexp) => {
  const match = stdout.match(regexp);
  return parseInt(match && (match[1] || 0), 10);
};

/* Helper methods to correctly run child test processes */
const testBin = (string, additionalEnvVariables = '') => {
  if (os.platform() === 'win32') {
    if (additionalEnvVariables !== '') {
      additionalEnvVariables = additionalEnvVariables.split(' ').join('&&set '); // eslint-disable-line no-param-reassign
      additionalEnvVariables = `set ${additionalEnvVariables}&&`; // eslint-disable-line no-param-reassign
    }
    return `set NODE_ENV=test&&${additionalEnvVariables}${string}`;
  }
  return `NODE_ENV=test ${additionalEnvVariables} ${string}`;
};

function runInChildProcess (command, options = {}, envVariables = '') {
  return done => pipe(exec(testBin(command, envVariables), options, done));
}

function integrationTestCommand (testDir, coverageDir) {
  return `istanbul cover --dir coverage/${coverageDir} --report lcovonly node_modules/mocha/bin/_mocha -- ${testDir} --recursive --require ./test/helpers/start-server`;
}

/* Test task definitions */
gulp.task('test:nodemon', gulp.series(done => {
  process.env.PORT = TEST_SERVER_PORT; // eslint-disable-line no-process-env
  process.env.NODE_DB_URI = TEST_DB_URI; // eslint-disable-line no-process-env
  done();
}, 'nodemon'));

gulp.task('test:prepare:mongo', cb => {
  const mongooseOptions = getDefaultConnectionOptions();
  const connectionUrl = getDevelopmentConnectionUrl(TEST_DB_URI);

  mongoose.connect(connectionUrl, mongooseOptions, err => {
    if (err) return cb(`Unable to connect to mongo database. Are you sure it's running? \n\n${err}`);
    return mongoose.connection.dropDatabase(err2 => {
      if (err2) return cb(err2);
      return mongoose.connection.close(cb);
    });
  });
});

gulp.task('test:prepare:server', gulp.series('test:prepare:mongo', done => {
  if (!server) {
    server = exec(testBin('node ./website/server/index.js', `NODE_DB_URI=${TEST_DB_URI} PORT=${TEST_SERVER_PORT}`), (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Problem with the server: ${error}`);
      }
      if (stderr) {
        console.error(stderr); // eslint-disable-line no-console
      }
      done();
    });
  }
}));

gulp.task('test:prepare:build', gulp.series('build', done => done()));

gulp.task('test:prepare', gulp.series(
  'test:prepare:build',
  'test:prepare:mongo',
  done => done(),
));

gulp.task('test:sanity', runInChildProcess(SANITY_TEST_COMMAND));

gulp.task('test:common', gulp.series('test:prepare:build', runInChildProcess(COMMON_TEST_COMMAND)));

gulp.task('test:common:clean', cb => {
  pipe(exec(testBin(COMMON_TEST_COMMAND), () => cb()));
});

gulp.task('test:common:watch', gulp.series('test:common:clean', () => gulp.watch(['common/script/**/*', 'test/common/**/*'], gulp.series('test:common:clean', done => done()))));

gulp.task('test:common:safe', gulp.series('test:prepare:build', cb => {
  const runner = exec(
    testBin(COMMON_TEST_COMMAND),
    (err, stdout) => { // eslint-disable-line handle-callback-err
      testResults.push({
        suite: 'Common Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/),
      });
      cb();
    },
  );
  pipe(runner);
}));

gulp.task('test:content', gulp.series('test:prepare:build',
  runInChildProcess(CONTENT_TEST_COMMAND, LIMIT_MAX_BUFFER_OPTIONS)));

gulp.task('test:content:clean', cb => {
  pipe(exec(testBin(CONTENT_TEST_COMMAND), LIMIT_MAX_BUFFER_OPTIONS, () => cb()));
});

gulp.task('test:content:watch', gulp.series('test:content:clean', () => gulp.watch(['common/script/content/**', 'test/**'], gulp.series('test:content:clean', done => done()))));

gulp.task('test:content:safe', gulp.series('test:prepare:build', cb => {
  const runner = exec(
    testBin(CONTENT_TEST_COMMAND),
    LIMIT_MAX_BUFFER_OPTIONS,
    (err, stdout) => { // eslint-disable-line handle-callback-err
      testResults.push({
        suite: 'Content Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/),
      });
      cb();
    },
  );
  pipe(runner);
}));

gulp.task('test:api:unit:run',
  runInChildProcess(integrationTestCommand('test/api/unit', 'coverage/api-unit')));

gulp.task('test:api:unit:watch', () => gulp.watch(['website/server/libs/*', 'test/api/unit/**/*', 'website/server/controllers/**/*'], gulp.series('test:api:unit:run', done => done())));

gulp.task('test:api-v3:integration', gulp.series('test:prepare:mongo',
  runInChildProcess(
    integrationTestCommand('test/api/v3/integration', 'coverage/api-v3-integration'),
    LIMIT_MAX_BUFFER_OPTIONS,
  )));

gulp.task('test:api-v3:integration:watch', () => gulp.watch([
  'website/server/controllers/api-v3/**/*', 'common/script/ops/*', 'website/server/libs/*.js',
  'test/api/v3/integration/**/*',
], gulp.series('test:api-v3:integration', done => done())));

gulp.task('test:api-v3:integration:separate-server', runInChildProcess(
  'mocha test/api/v3/integration --recursive --require ./test/helpers/start-server',
  LIMIT_MAX_BUFFER_OPTIONS,
  'LOAD_SERVER=0',
));

gulp.task('test:api-v4:integration', gulp.series('test:prepare:mongo',
  runInChildProcess(
    integrationTestCommand('test/api/v4', 'api-v4-integration'),
    LIMIT_MAX_BUFFER_OPTIONS,
  )));

gulp.task('test:api-v4:integration:separate-server', runInChildProcess(
  'mocha test/api/v4 --recursive --require ./test/helpers/start-server',
  LIMIT_MAX_BUFFER_OPTIONS,
  'LOAD_SERVER=0',
));

gulp.task('test:api:unit', gulp.series(
  'test:prepare:mongo',
  'test:api:unit:run',
  done => done(),
));

gulp.task('test', gulp.series(
  'test:sanity',
  'test:content',
  'test:common',
  'test:api:unit:run',
  'test:api-v3:integration',
  'test:api-v4:integration',
  done => done(),
));

gulp.task('test:api-v3', gulp.series(
  'test:api:unit',
  'test:api-v3:integration',
  done => done(),
));
