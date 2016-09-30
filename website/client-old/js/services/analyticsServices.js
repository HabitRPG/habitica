'use strict';

(function(){
  var REQUIRED_FIELDS = ['hitType','eventCategory','eventAction'];
  var ALLOWED_HIT_TYPES = ['pageview','screenview','event','transaction','item','social','exception','timing'];

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
    amplitude.init(window.env.AMPLITUDE_KEY, user ? user._id : undefined);

    // Google Analytics (aka Universal Analytics)
    window['GoogleAnalyticsObject'] = 'ga';
    window['ga'] = window['ga'] || function() {
        (window['ga'].q = window['ga'].q || []).push(arguments)
      }, window['ga'].l = 1 * new Date();
    ga('create', window.env.GA_ID, user ? {'userId': user._id} : undefined);

    // Facebook
    var n = window.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    fbq('init', window.env.FACEBOOK_ANALYTICS);

    function loadScripts() {
      setTimeout(function() {
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
        a.async = true;
        a.src = '//www.google-analytics.com/analytics.js';
        m.parentNode.insertBefore(a, m);

        // Facebook
        var t = document.createElement('script');
        var f = document.getElementsByTagName('script')[0];
        t.async = true;
        t.src = 'https://connect.facebook.net/en_US/fbevents.js';
        f.parentNode.insertBefore(t, f);
      });
    }

    function register() {
      setTimeout(function() {
        fbq('track', 'CompleteRegistration');
      });
    }

    function login() {
      setTimeout(function() {
        amplitude.setUserId(user._id);
        ga('set', {'userId':user._id});
      });
    }

    function track(properties) {
      setTimeout(function() {
        if(_doesNotHaveRequiredFields(properties)) { return false; }
        if(_doesNotHaveAllowedHitType(properties)) { return false; }

        amplitude.logEvent(properties.eventAction,properties);
        ga('send',properties);
        if(properties.hitType === 'pageview') {
          fbq('track', 'PageView');
        }
      });
    }

    function updateUser(properties) {
      setTimeout(function() {
        properties = properties || {};

        _gatherUserStats(user, properties);

        amplitude.setUserProperties(properties);
        ga('set',properties);
      });
    }

    if (window.env.NODE_ENV === 'production') loadScripts();

    return {
      loadScripts: loadScripts,
      register: register,
      login: login,
      track: track,
      updateUser: updateUser
    };
  }

  function _gatherUserStats(user, properties) {
    if (user._id) properties.UUID = user._id;
    if (user.stats) {
      properties.Class = user.stats.class;
      properties.Experience = Math.floor(user.stats.exp);
      properties.Gold = Math.floor(user.stats.gp);
      properties.Health = Math.ceil(user.stats.hp);
      properties.Level = user.stats.lvl;
      properties.Mana = Math.floor(user.stats.mp);
    }

    properties.balance = user.balance;

    properties.tutorialComplete = user.flags && user.flags.tour && user.flags.tour.intro === -2;
    if (user.habits && user.dailys && user.todos && user.rewards) {
      properties["Number Of Tasks"] = {
        habits: user.habits.length,
        dailys: user.dailys.length,
        todos: user.todos.length,
        rewards: user.rewards.length
      };
    }
    if (user.contributor && user.contributor.level) properties.contributorLevel = user.contributor.level;
    if (user.purchased && user.purchased.plan.planId) properties.subscription = user.purchased.plan.planId;
  }

  function _doesNotHaveRequiredFields(properties) {
    if (!_.isEqual(_.keys(_.pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
      console.log('Analytics tracking calls must include the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
      return true;
    }
  }

  function _doesNotHaveAllowedHitType(properties) {
    if (!_.contains(ALLOWED_HIT_TYPES, properties.hitType)) {
      console.log('Hit type of Analytics event must be one of the following: ' + JSON.stringify(ALLOWED_HIT_TYPES));
      return true;
    }
  }
}());
