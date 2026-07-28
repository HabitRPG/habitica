import nconf from 'nconf';
import { serveClient } from '../../libs/client';

const BASE_URL = nconf.get('BASE_URL');

const api = {};

// All the routes (except for the api and payments routes) serve the new client side
// The code that does it can be found in /middlewares/notFound.js
api.getNewClient = {
  method: 'GET',
  url: '/',
  noLanguage: true,
  async handler (req, res) {
    return serveClient(res);
  },
};

api.robotsTxt = {
  method: 'GET',
  url: '/robots.txt',
  noLanguage: true,
  async handler (req, res) {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml`);
  },
};
export default api;
