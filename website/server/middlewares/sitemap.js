import expressSitemapXml from 'express-sitemap-xml';
import nconf from 'nconf';

const BASE_URL = nconf.get('BASE_URL');

function makeSitemapUrls () {
  return [
    '/',
    '/static/login',
    '/static/register',
    '/stati/community-guidelines',
    '/static/contact',
    '/static/faq',
    '/static/features',
    '/static/group-plans',
    '/static/news',
    '/static/overview',
    '/static/press-kit',
    '/static/privacy',
    '/static/terms',
  ];
}

export default expressSitemapXml(makeSitemapUrls, BASE_URL);
