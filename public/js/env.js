"use strict";

window.env = window.env || {}; //FIX tests

// If Moment.js is loaded, 
if(window.moment && window.env.language && window.env.language.momentLang && window.env.language.momentLangCode){
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.text = window.env.language.momentLang;
  head.appendChild(script);
  window.moment.lang(window.env.language.momentLangCode);
}

window.env.t = function(stringName, vars){
  var string = window.env.translations[stringName];
  if(!string) return window._.template(window.env.translations.stringNotFound, {string: stringName});

  return vars === undefined ? string : window._.template(string, vars);    
}