import _ from 'lodash';

const ROUTE_BLACKLIST = [
  {
    url:'/user',
    method:'DELETE'
  }
];

module.exports.isRouteBlacklisted = function(url, method) {
  return typeof _.find(ROUTE_BLACKLIST, {
    url: url,
    method: method
  }) !== 'undefined';
};