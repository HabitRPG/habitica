const ROOT = `${__dirname}/../../../`;

const TEN_MINUTES = 1000 * 60 * 10;

export function serveClient (expressRes) { // eslint-disable-line import/prefer-default-export
  return expressRes.sendFile('./website/client/dist/index.html', { root: ROOT, maxAge: TEN_MINUTES });
}
