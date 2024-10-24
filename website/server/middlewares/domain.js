import domainMiddleware from 'domain-middleware';

import logger from '../libs/logger';

export default function implementDomainMiddleware (server, mongoose) {
  return domainMiddleware({
    server: {
      close () {
        logger.info('Closing Server');
        server.close();
        mongoose.connection.close();
      },
    },
    killTimeout: 10000,
  });
}
