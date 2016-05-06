import mongoose from 'mongoose';
import logging  from '../website/src/libs/logging';
import nconf    from 'nconf';
import utils    from '../website/src/libs/utils';
import repl     from 'repl';
import gulp     from 'gulp';

// Add additional properties to the repl's context
let improveRepl = (context) => {

  // Let "exit" and "quit" terminate the console
  ['exit', 'quit'].forEach((term) => {
    Object.defineProperty(context, term, { get() { process.exit(); }});
  });

  // "clear" clears the screen
  Object.defineProperty(context, 'clear', { get() {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  }});

  utils.setupConfig();

  context.Challenge = require('../website/src/models/challenge').model;
  context.Group     = require('../website/src/models/group').model;
  context.User      = require('../website/src/models/user').model;

  var isProd = nconf.get('NODE_ENV') === 'production';
  var mongooseOptions = !isProd ? {} : {
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };
  mongoose.connect(
    nconf.get('NODE_DB_URI'),
    mongooseOptions,
    function(err) {
      if (err) throw err;
      logging.info('Connected with Mongoose');
    }
  )
};

gulp.task('console', (cb) => {
  improveRepl(repl.start({
    prompt: 'Habitica > '
  }).context);
});
