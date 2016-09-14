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
        if(Content.petsInfo.hasOwnProperty(name)) {
          return Content.petsInfo[name].text();
        } else {
          return window.env.t('noActivePet');
        }
      } else if(type === 'mount') {
        if(Content.mountsInfo.hasOwnProperty(name)) {
          return Content.mountsInfo[name].text();
        } else {
          return window.env.t('noActiveMount');
        }
      }
    }

    function formatBackground(background) {
      var bg = Content.background;
      
      if(bg.hasOwnProperty(background)) {
        return bg[background].text() + ' (' + bg[background].set.text() + ')';
      }
      return window.env.t('noBackground');
    }

    return {
      formatAnimal: formatAnimal,
      formatBackground: formatBackground
    };
  }
}());
