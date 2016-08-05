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
