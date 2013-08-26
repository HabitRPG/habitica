'use strict';

/**
 * The nav controller:
 * - sets the menu options, should we do it dynamic so it generates the menu like: width = 1/elements * 100 ?
 * - exposes the model to the template and provides event handlers
 */

habitrpg.controller( 'NavCtrl', function NavCtrl( $scope, $location, filterFilter ) {
  var nav = $scope.nav = [

    {
    'name' :'#habit',
    'img'  :'explorer.png'
    },

    {
    'name' :'#daily',
    'img'  :'contacts.png'
    },

    {
    'name' :'#todo',
    'img'  :'todo.png'
    },

    {
    'name' :'#reward',
    'img'  :'explorer.png'
    }

  ]

});
