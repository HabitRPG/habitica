import { serveClient } from '../../libs/client';

const api = {};

const ROOT = `${__dirname}/../../../client/dist/static`;

function serveStaticPage (expressRes, pageName, langCode) {
  return expressRes.sendFile(`./${pageName}/index.${langCode}.html`, { root: ROOT });
}

// All the routes (except for the api and payments routes) serve the new client side
// The code that does it can be found in /middlewares/notFound.js
api.getClient = {
  method: 'GET',
  url: '/',
  noLanguage: true,
  async handler (req, res) {
    return serveClient(res);
  },
};

api.getStaticHomme = {
  method: 'GET',
  url: '/static/home',
  async handler (req, res) {
    return serveStaticPage(res, 'home', req.language);
  },
};

export default api;
