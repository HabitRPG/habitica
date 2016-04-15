import locals from '../../middlewares/api-v3/locals';
import _ from 'lodash';

const marked = require('marked');

let api = {};

const TOTAL_USER_COUNT = '1,100,000';

api.getFrontPage = {
  method: 'GET',
  url: '/',
  middlewares: [locals],
  runCron: false,
  async handler (req, res) {
    if (!req.header('x-api-user') && !req.header('x-api-key') && !(req.session && req.session.userId)) {
      return res.redirect('/static/front');
    }

    res.render('index.jade', {
      title: 'Habitica | Your Life The Role Playing Game',
      env: res.locals.habitrpg,
    });
  },
};

// TODO remove api static page
let staticPages = ['front', 'privacy', 'terms', 'api', 'features',
            'videos', 'contact', 'plans', 'new-stuff', 'community-guidelines',
            'old-news', 'press-kit', 'faq', 'overview', 'apps',
            'clear-browser-data', 'merch'];

_.each(staticPages, (name) => {
  api[`get${name}Page`] = {
    method: 'GET',
    url: `/static/${name}`,
    middlewares: [locals],
    runCron: false,
    async handler (req, res) {
      res.render(`static/${name}.jade`, {
        env: res.locals.habitrpg,
        marked,
        userCount: TOTAL_USER_COUNT,
      });
    },
  };
});

let shareables = ['level-up', 'hatch-pet', 'raise-pet', 'unlock-quest', 'won-challenge', 'achievement'];

_.each(shareables, (name) => {
  api[`get${name}ShareablePage`] = {
    method: 'GET',
    url: `/social/${name}`,
    middlewares: [locals],
    runCron: false,
    async handler (req, res) {
      res.render(`social/${name}`, {
        env: res.locals.habitrpg,
        marked,
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
    res.redirect('http://habitica.wikia.com/wiki/App_and_Extension_Integrations');
  },
};


module.exports = api;
