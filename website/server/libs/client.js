const ROOT = `${__dirname}/../../../`;

const TEN_MINUTES = 1000 * 60 * 10;

export function serveClient (expressRes, file = 'index.html') { // eslint-disable-line import/prefer-default-export
  return expressRes.sendFile(`./website/client/dist/${file}`, { root: ROOT, maxAge: TEN_MINUTES });
}
