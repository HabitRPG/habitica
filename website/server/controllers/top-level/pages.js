import locals from '../../middlewares/locals';
import _ from 'lodash';
import md from 'habitica-markdown';
import nconf from 'nconf';

let api = {};

const IS_PROD = nconf.get('IS_PROD');
const TOTAL_USER_COUNT = '1,500,000';
const LOADING_SCREEN_TIPS = 33;
const IS_NEW_CLIENT_ENABLED = nconf.get('NEW_CLIENT_ENABLED') === 'true';

api.getFrontPage = {
  method: 'GET',
  url: '/',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    if (!req.header('x-api-user') && !req.header('x-api-key') && !(req.session && req.session.userId)) {
      return res.redirect('/static/front');
    }

    return res.render('index.jade', {
      title: 'Habitica | Your Life The Role Playing Game',
      env: res.locals.habitrpg,
      loadingScreenTip: Math.floor(Math.random() * LOADING_SCREEN_TIPS) + 1, // Random tip between 1 and LOADING_SCREEN_TIPS
    });
  },
};

let staticPages = ['front', 'privacy', 'terms', 'features',
            'videos', 'contact', 'plans', 'new-stuff', 'community-guidelines',
            'old-news', 'press-kit', 'faq', 'overview', 'apps',
            'clear-browser-data', 'merch', 'maintenance-info'];

_.each(staticPages, (name) => {
  api[`get${name}Page`] = {
    method: 'GET',
    url: `/static/${name}`,
    middlewares: [locals],
    runCron: false,
    async handler (req, res) {
      return res.render(`static/${name}.jade`, {
        env: res.locals.habitrpg,
        md,
        userCount: TOTAL_USER_COUNT,
      });
    },
  };
});

api.redirectApi = {
  method: 'GET',
  url: '/static/api',
  runCron: false,
  async handler (req, res) {
    res.redirect(301, '/apidoc');
  },
};

let shareables = ['level-up', 'hatch-pet', 'raise-pet', 'unlock-quest', 'won-challenge', 'achievement'];

_.each(shareables, (name) => {
  api[`get${name}ShareablePage`] = {
    method: 'GET',
    url: `/social/${name}`,
    middlewares: [locals],
    runCron: false,
    async handler (req, res) {
      return res.render(`social/${name}`, {
        env: res.locals.habitrpg,
        md,
        userCount: TOTAL_USER_COUNT,
      });
    },
  };
});

api.redirectExtensionsPage = {
  method: 'GET',
  url: '/static/extensions',
  runCron: false,
  async handler (req, res) {
    return res.redirect('http://habitica.wikia.com/wiki/App_and_Extension_Integrations');
  },
};

// All requests to /new_app (expect /new_app/static) should serve the new client in development
if (IS_PROD && IS_NEW_CLIENT_ENABLED) {
  api.getNewClient = {
    method: 'GET',
    url: /^\/new-app($|\/(?!(static\/.?|static$)))/,
    async handler (req, res) {
      if (!(req.session && req.session.userId)) {
        return res.redirect('/static/front');
      }

      return res.sendFile('./dist-client/index.html', {root: `${__dirname}/../../../../`});
    },
  };
}

module.exports = api;
