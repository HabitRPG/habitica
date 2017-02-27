'use strict';

(function() {
  angular
    .module('habitrpg')
    .directive('undoButton', undoButton);

  undoButton.$inject = [
    'Undo',
  ];

  function undoButton(Undo) {
    return {
      link: function (scope, element, attrs) {
        function functionToBeCalled () {
          Undo.undoAction();
        }

        element.on('click', functionToBeCalled);
      }
    };
  }
}());
