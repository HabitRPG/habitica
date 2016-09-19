import locals from '../../middlewares/locals';
import _ from 'lodash';
import md from 'habitica-markdown';

let api = {};

const TOTAL_USER_COUNT = '1,500,000';
const LOADING_SCREEN_TIPS = 32;

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


module.exports = api;
