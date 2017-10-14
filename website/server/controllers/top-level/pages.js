import { serveClient } from '../../libs/client';

let api = {};

// All requests to /new_app (except /new_app/static) should serve the new client in development
// if (IS_PROD && IS_NEW_CLIENT_ENABLED) {

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

module.exports = api;
