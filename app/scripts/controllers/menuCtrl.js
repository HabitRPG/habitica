'use strict';

/**
 * The menu controller:
 * - sets the menu options, should we do it dynamic so it generates the menu like: width = 1/elements * 100 ?
 * - exposes the model to the template and provides event handlers
 */

habitrpg.controller( 'MenuCtrl', function MenuCtrl( $scope, $location, filterFilter) {

 var nav = $scope.nav = [

    {
    'name' :'#habit',
    'img'  :'explorer.png',
    'link' :'Habits'
    },

    {
    'name' :'#daily',
    'img'  :'contacts.png',
    'link' :'Dailies'
    },

    {
    'name' :'#todo',
    'img'  :'todo.png',
    'link' :'Todos'
    },

    {
    'name' :'#reward',
    'img'  :'explorer.png',
    'link' :'Rewards'
    }

  ]





});
