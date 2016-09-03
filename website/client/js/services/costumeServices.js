'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Costume', costumeFactory);

  costumeFactory.$inject = [
    'Content'
  ];

  function costumeFactory(Content) {
    function animalInfo(name, type) {
      var tmp = name.split('-');
      var data = {
        egg: tmp[0],
        potion: tmp[1]
      };
      data.isSpecial = !Content.hatchingPotions[data.potion];
      return data;
    }
    
    function formatAnimal(name, type) {
      var info = animalInfo(name, type);
      if(!info.isSpecial) {
        var animal = {
          potion: Content.hatchingPotions[info.potion].text()
        };
        animal[type === 'pet' ? 'egg' : 'mount'] = Content.eggs[info.egg].text();
        return window.env.t(type+'Name', animal);
      } else {
        var capitalizedType = type.charAt(0).toUpperCase() + type.slice(1); // pet -> Pet, mount -> Mount
        return window.env.t(Content['special' + capitalizedType + 's'][name]);
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
