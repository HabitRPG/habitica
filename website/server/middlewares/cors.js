export default function corsMiddleware (req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,HEAD,DELETE',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key,x-client',
    // Expose rate limit headers to CORS requests
    'Access-Control-Expose-Headers': 'X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset,Retry-After',
    // Content-Security-Policy based on Helmet defaults
    'Content-Security-Policy': "default-src 'self' habitica.com *.habitica.com *.amazon.com *.amazonaws.com *.loggly.com *.stripe.com *.stripe.network; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src * data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'",
  });
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  return next();
}
