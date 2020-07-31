import mongoose from 'mongoose';
import nconf from 'nconf';
import repl from 'repl';
import gulp from 'gulp';
import logger from '../website/server/libs/logger';
import {
  getDevelopmentConnectionUrl,
  getDefaultConnectionOptions,
} from '../website/server/libs/mongodb';

// Add additional properties to the repl's context
const improveRepl = context => {
  // Let "exit" and "quit" terminate the console
  ['exit', 'quit'].forEach(term => {
    Object.defineProperty(context, term, {
      get () { // eslint-disable-line getter-return
        process.exit();
      },
    });
  });

  // "clear" clears the screen
  Object.defineProperty(context, 'clear', {
    get () { // eslint-disable-line getter-return
      process.stdout.write('\u001B[2J\u001B[0;0f');
    },
  });

  context.Challenge = require('../website/server/models/challenge').model; // eslint-disable-line global-require
  context.Group = require('../website/server/models/group').model; // eslint-disable-line global-require
  context.User = require('../website/server/models/user').model; // eslint-disable-line global-require

  const IS_PROD = nconf.get('NODE_ENV') === 'production';
  const NODE_DB_URI = nconf.get('NODE_DB_URI');

  const mongooseOptions = getDefaultConnectionOptions();
  const connectionUrl = IS_PROD ? NODE_DB_URI : getDevelopmentConnectionUrl(NODE_DB_URI);

  mongoose.connect(
    connectionUrl,
    mongooseOptions,
    err => {
      if (err) throw err;
      logger.info('Connected with Mongoose');
    },
  );
};

gulp.task('console', done => {
  improveRepl(repl.start({
    prompt: 'Habitica > ',
  }).context);
  done();
});
