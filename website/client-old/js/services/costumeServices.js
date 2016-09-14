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
      if(type === 'pet' && name in Content.petsInfo) {
        return Content.petsInfo[name].text();
      } else if(type === 'mount' && name in Content.mountsInfo) {
        return Content.mountsInfo[name].text();
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
