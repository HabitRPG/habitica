// TODO in api-v2 this module also checked memory usage every x minutes and
// threw an error in case of low memory avalible (possible memory leak)
// it's yet to be decided whether to keep it or not
import domainMiddleware from 'domain-middleware';

module.exports = function implementDomainMiddleware (server, mongoose) {
  return domainMiddleware({
    server: {
      close () {
        server.close();
        mongoose.connection.close();
      },
    },
    killTimeout: 10000,
  });
};
