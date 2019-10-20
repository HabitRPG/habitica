import domainMiddleware from 'domain-middleware';

export default function implementDomainMiddleware (server, mongoose) {
  return domainMiddleware({
    server: {
      close () {
        server.close();
        mongoose.connection.close();
      },
    },
    killTimeout: 10000,
  });
}
