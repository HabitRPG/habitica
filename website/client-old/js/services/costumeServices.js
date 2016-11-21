'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Costume', costumeFactory);

  costumeFactory.$inject = [
    'Content'
  ];

  function costumeFactory(Content) {
    
    function formatAnimal(name, type) {
      if(type === 'pet') {
        if(Content.petInfo.hasOwnProperty(name)) {
          return Content.petInfo[name].text();
        } else {
          return window.env.t('noActivePet');
        }
      } else if(type === 'mount') {
        if(Content.mountInfo.hasOwnProperty(name)) {
          return Content.mountInfo[name].text();
        } else {
          return window.env.t('noActiveMount');
        }
      }
    }

    function formatBackground(background) {
      var bg = Content.appearances.background;
      
      if(bg.hasOwnProperty(background)) {
        return bg[background].text() + ' (' + window.env.t(bg[background].set.text) + ')';
      }
      return window.env.t('noBackground');
    }

    return {
      formatAnimal: formatAnimal,
      formatBackground: formatBackground
    };
  }
}());
