'use strict';

/**
 * Services for each tour step when you unlock features
 */

angular.module('habitrpg').factory('Guide',
['$rootScope', 'User', '$timeout', '$state',
function($rootScope, User, $timeout, $state) {

  var chapters = {
    intro: [
      [ //0
        {
          state: 'tasks',
          element: ".task-column.todos",
          content: window.env.t('tourWelcome'),
          placement: "top"
        }
      ], [ //1
        {
          state: 'tasks',
          element: '.sticky-wrapper',
          content: window.env.t('tourExp'),
          placement: 'bottom'
        }, {
          state: 'tasks',
          element: ".task-column.dailys",
          content: window.env.t('tourDailies'),
          placement: "top"
        }
      ], [ //2
        {
          orphan: true,
          content: window.env.t('tourCron'),
          placement: 'bottom'
        }, {
          state: 'tasks',
          element: '.meter.health',
          content: window.env.t('tourHP'),
          placement: 'bottom'
        }, {
          state: 'tasks',
          element: ".task-column.habits",
          content: window.env.t('tourHabits'),
          placement: "right"
        }
      ], [ //3
        {
          state: 'tasks',
          element: ".hero-stats",
          content: window.env.t('tourStats')
        }, {
          state: 'tasks',
          element: ".task-column.rewards",
          content: window.env.t('tourGP'),
          placement: 'left'
        }
      ], [ //4
        {
          state: 'tasks',
          element: '.main-herobox',
          content: window.env.t('tourAvatar'),
          placement: 'bottom'
        }
      ], [ //5
        {
          state: 'options.profile.avatar',
          orphan: true,
          content: window.env.t('tourScrollDown')
        }, {
          element: "ul.toolbar-nav",
          backdrop:false,
          content: window.env.t('tourMuchMore'),
          placement: "bottom",
          final: true,
          //onHidden: function(){
          //  $rootScope.$watch('user.flags.customizationsNotification', _.partial(goto, 'intro', 4));
          //}
        }
      ]
    ],
    classes: [
      [
        {
          state: 'options.inventory.equipment',
          element: '.equipment-tab',
          title: window.env.t('classGear'),
          content: window.env.t('classGearText', {klass: User.user.stats.class})
        }, {
          state: 'options.profile.stats',
          element: ".allocate-stats",
          title: window.env.t('stats'),
          content: window.env.t('classStats')
        }, {
          state: 'options.profile.stats',
          element: ".auto-allocate",
          title: window.env.t('autoAllocate'),
          placement: 'left',
          content: window.env.t('autoAllocateText')
        }, {
          element: ".meter.mana",
          title: window.env.t('spells'),
          content: window.env.t('spellsText') + " <a target='_blank' href='http://habitrpg.wikia.com/wiki/Todos'>" + window.env.t('toDo') + "</a>."
        }, {
          orphan: true,
          title: window.env.t('readMore'),
          content: window.env.t('moreClass') + " <a href='http://habitrpg.wikia.com/wiki/Class_System' target='_blank'>Wikia</a>.",
          final: true
        }
      ]
    ]
  }
  _.each(chapters, function(chapter, k){
    _(chapter).flatten().each(function(step) {
      step.content = "<div><div class='" + (env.worldDmg.guide ? "npc_justin_broken" : "npc_justin") + " float-left'></div>" + step.content + "</div>";
      $(step.element).popover('destroy'); // destroy existing hover popovers so we can add our own
      step.onShow = function(){
        // step.path doesn't work in Angular do to async ui-router. Our custom solution:
        if (step.state && !$state.is(step.state)) {
          // $state.go() returns a promise, necessary for async tour steps; however, that's not working here - have to use timeout instead :/
          $state.go(step.state);
          return $timeout(function(){});
        }
      }
      step.onHide = function(){
        if (step.final) { // -1 indicates complete
          var ups={};ups['flags.tour.'+k] = -1;
          User.set(ups);
        }
      }
    })
  })

  var tour = {};
  _.each(chapters, function(v,k){
    tour[k] = new Tour({
      backdrop: true,
      template: function(i,step){
        return '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> ' + (true ? '<button class="btn btn-sm btn-default" data-role="end">' + window.env.t('ok') + '</button> ' : '') +' </div> </div>';
        // FIXME: see https://github.com/HabitRPG/habitrpg/issues/4726
        //return '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> ' + (step.final ? '<button class="btn btn-sm btn-default" data-role="end">' + window.env.t('ok') + '</button> ' : '') +' </div> </div>';
      },
      storage: false,
      //onEnd: function(){
      //  User.set({'flags.showTour': false});
      //}
    });
  });

  var goto = function(chapter, page, force) {
    var curr = User.user.flags.tour[chapter];
    if ((page != curr+1 || curr > page) && !force) return;
    var updates = {};updates['flags.tour.'+chapter] = page;
    User.set(updates);
    var end = tour[chapter]._options.steps.length;
    tour[chapter].addSteps(chapters[chapter][page]);
    tour[chapter].restart(); // Tour doesn't quite mesh with our handling of flags.showTour, just restart it on page load
    tour[chapter].goTo(end);
  }

  //Init and show the welcome tour (only after user is pulled from server & wrapped).
  var watcher = $rootScope.$watch('User.user.ops.update', function(updateFn){
    if (!updateFn) return; // only run after user has been wrapped
    watcher(); // deregister watcher
    goto('intro', User.user.flags.tour.intro, true);

    var alreadyShown = function(before, after) { return !(!before && after === true) };
    //$rootScope.$watch('user.flags.dropsEnabled', _.flow(alreadyShown, function(already) { //FIXME requires lodash@~3.2.0
    $rootScope.$watch('user.flags.dropsEnabled', function(after, before) {
      if (alreadyShown(before,after)) return;
      var eggs = User.user.items.eggs || {};
      if (!eggs) eggs['Wolf'] = 1; // This is also set on the server
      $rootScope.openModal('dropsEnabled');
    });
    $rootScope.$watch('user.flags.rebirthEnabled', function(after, before) {
      if (alreadyShown(before, after)) return;
      $rootScope.openModal('rebirthEnabled');
    });
  });

  return {
    goto: goto
  };

}]);
