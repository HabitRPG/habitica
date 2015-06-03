'use strict'
//Adapted from http://stackoverflow.com/questions/23785603/angularjs-testing-with-jasmine-and-mixpanel
// @TODO: replace with an injectable mixpanel instance for testing

var MixpanelMock;

MixpanelMock = (function() {
  function MixpanelMock() {}

  MixpanelMock.prototype.track = function() {
    return console.log("mixpanel.track", arguments);
  };

  MixpanelMock.prototype.register_once = function() {
    return console.log("mixpanel.register_once", arguments);
  };

  MixpanelMock.prototype.identify = function() {
    return console.log("mixpanel.identify", arguments);
  };

  MixpanelMock.prototype.register = function() {
    return console.log("mixpanel.register", arguments);
  };

  return MixpanelMock;

})();

window.mixpanel = new MixpanelMock();
