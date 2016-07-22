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
      var data = {};
      data.egg = tmp[0];
      data.potion = tmp[1];
      data.isBasic = Content.hatchingPotions[data.potion] ? true : false;
      return data;
    }
    
    function formatAnimal(name, type) {
      var info = animalInfo(name, type);
      if(info.isBasic) {
        var animal = {
          potion: Content.hatchingPotions[info.potion].text()
        };
        animal[type == 'pet' ? 'egg' : 'mount'] = Content.eggs[info.egg].text()
        return window.env.t(type+'Name', animal)
      } else {
        return type == 'pet' ? window.env.t(Content.specialPets[name]) : window.env.t(Content.specialMounts[name])
      }
    }
    
    return {
      formatAnimal: formatAnimal
    }
  }
}());