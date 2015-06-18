/**
 * Created by Sabe on 6/15/2015.
 */
'use strict';

angular
  .module('habitrpg')
  .factory('Analytics', analyticsFactory);

analyticsFactory.$inject = [
  'User'
];

function analyticsFactory(User) {

  var user = User.user;

  // Amplitude
  var r = window.amplitude || {};
  r._q = [];
  function a(window) {r[window] = function() {r._q.push([window].concat(Array.prototype.slice.call(arguments, 0)));}}
  var i = ["init", "logEvent", "logRevenue", "setUserId", "setUserProperties", "setOptOut", "setVersionName", "setDomain", "setDeviceId", "setGlobalUserProperties"];
  for (var o = 0; o < i.length; o++) {a(i[o])}
  window.amplitude = r;
  amplitude.init(window.env.AMPLITUDE_KEY);

  // Google Analytics (aka Universal Analytics)
  window['GoogleAnalyticsObject'] = 'ga';
  window['ga'] = window['ga'] || function() {
      (window['ga'].q = window['ga'].q || []).push(arguments)
    }, window['ga'].l = 1 * new Date();
  ga('create', window.env.GA_ID, 'auto');

  // Mixpanel
  (function(b) {
    if (!b.__SV) {
      var i, g;
      window.mixpanel = b;
      b._i = [];
      b.init = function(a, e, d) {
        function f(b, h) {
          var a = h.split(".");
          2 == a.length && (b = b[a[0]], h = a[1]);
          b[h] = function() {
            b.push([h].concat(Array.prototype.slice.call(arguments, 0)))
          }
        }
        var c = b;
        "undefined" !== typeof d ? c = b[d] = [] : d = "mixpanel";
        c.people = c.people || [];
        c.toString = function(b) {
          var a = "mixpanel";
          "mixpanel" !== d && (a += "." + d);
          b || (a += " (stub)");
          return a
        };
        c.people.toString = function() {
          return c.toString(1) + ".people (stub)"
        };
        i = "disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
        for (g = 0; g < i.length; g++) f(c, i[g]);
        b._i.push([a, e, d])
      };
      b.__SV = 1.2;
    }
  })(window.mixpanel || []);
  mixpanel.init(window.env.MIXPANEL_TOKEN);

  function loadScripts() {
    // Amplitude
    var n = document.createElement("script");
    var s = document.getElementsByTagName("script")[0];
    n.type = "text/javascript";
    n.async = true;
    n.src = "https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.2.0-min.gz.js";
    s.parentNode.insertBefore(n, s);

    // Google Analytics
    var a = document.createElement('script');
    var m = document.getElementsByTagName('script')[0];
    a.async = 1;
    a.src = '//www.google-analytics.com/analytics.js';
    m.parentNode.insertBefore(a, m);

    // Mixpanel
    var g = document.createElement("script");
    var e = document.getElementsByTagName("script")[0];
    g.type = "text/javascript";
    g.async = !0;
    g.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    e.parentNode.insertBefore(g, e);
  }

  function register() {
    amplitude.setUserId(user._id);
    ga('set', {'userId':user._id});
    mixpanel.alias(user._id);
  }

  function login() {
    amplitude.setUserId(user._id);
    ga('set', {'userId':user._id});
    mixpanel.identify(user._id);
  }

  function track(properties) {
    var REQUIRED_FIELDS = ['hitType','eventCategory','eventAction'];
    var ALLOWED_HIT_TYPES = ['pageview','screenview','event','transaction','item','social','exception','timing'];
    if (!_.isEqual(_.keys(_.pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
      return console.log('Analytics tracking calls must include the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
    }
    if (!_.contains(ALLOWED_HIT_TYPES, properties.hitType)) {
      return console.log('Hit type of Analytics event must be one of the following: ' + JSON.stringify(ALLOWED_HIT_TYPES));
    }

    amplitude.logEvent(properties.eventAction,properties);
    mixpanel.track(properties.eventAction,properties);
    ga('send',properties);
  }

  function updateUser(properties) {
    if (typeof properties === 'undefined') properties = {};

    if (typeof user._id !== 'undefined') properties.UUID = user._id;
    if (typeof user.stats.class !== 'undefined') properties.Class = user.stats.class;
    if (typeof user.stats.exp !== 'undefined') properties.Experience = Math.floor(user.stats.exp);
    if (typeof user.stats.gp !== 'undefined') properties.Gold = Math.floor(user.stats.gp);
    if (typeof user.stats.hp !== 'undefined') properties.Health = Math.ceil(user.stats.hp);
    if (typeof user.stats.lvl !== 'undefined') properties.Level = user.stats.lvl;
    if (typeof user.stats.mp !== 'undefined') properties.Mana = Math.floor(user.stats.mp);
    if (typeof user.contributor.level !== 'undefined') properties.contributorLevel = user.contributor.level;
    if (typeof user.purchased.plan.planId !== 'undefined') properties.subscription = user.purchased.plan.planId;

    amplitude.setUserProperties(properties);
    ga('set',properties);
    mixpanel.register(properties);
  }

  return {
    loadScripts: loadScripts,
    register: register,
    login: login,
    track: track,
    updateUser: updateUser
  };
}
