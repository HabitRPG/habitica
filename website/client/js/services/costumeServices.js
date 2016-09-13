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

    function bgString(set, bg) {
      var setString = window.env.t(set);
      var setNumber = setString.match(/^[^:]+/)[0].toLowerCase();
      var bgString = Content.backgrounds[set][bg].text(window.env.language.code);
      return bgString + " - " + setNumber.charAt(0).toUpperCase() + setNumber.slice(1);
    }

    function formatBackground(background) {
      var backgrounds = Content.backgrounds;
      for (var set in backgrounds) {
        if (backgrounds.hasOwnProperty(set)) {
          for (var bg in backgrounds[set]) {
            if (backgrounds[set].hasOwnProperty(bg)) {
              if (background === bg) {
                return bgString(set, bg);
              }
            }
          }
        }
      }
      return window.env.t('noBackground');
    }

    return {
      formatAnimal: formatAnimal,
      formatBackground: formatBackground
    };
  }
}());
