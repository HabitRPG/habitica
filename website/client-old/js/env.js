"use strict";

window.env = window.env || {}; //FIX tests

// If Moment.js is loaded,
if(window.moment && window.env.language && window.env.language.momentLang && window.env.language.momentLangCode){
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.text = window.env.language.momentLang;
  head.appendChild(script);
  window.moment.locale(window.env.language.momentLangCode);
}

window.habitrpgShared.i18n.strings = window.env.translations;
window.env.t = window.habitrpgShared.i18n.t;
