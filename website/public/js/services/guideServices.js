'use strict';

/**
 * Services for each tour step when you unlock features
 */

angular.module('habitrpg').factory('Guide',
['$rootScope', 'User', '$timeout', '$state',
function($rootScope, User, $timeout, $state) {
  /**
   * Init and show the welcome tour. Note we do it listening to a $rootScope broadcasted 'userLoaded' message,
   * this because we need to determine whether to show the tour *after* the user has been pulled from the server,
   * otherwise it's always start off as true, and then get set to false later
   */
  var tourRunning = false;
  $rootScope.$on('userUpdated', initTour);
  function initTour(){
    if (User.user.flags.showTour === false || tourRunning) return;
    tourRunning = true;
    var tourSteps = [
      {
        orphan:true,
        title: window.env.t('welcomeHabit'),
        content: window.env.t('welcomeHabitT1') + " <a href='http://www.kickstarter.com/profile/1823740484' target='_blank'>Justin</a>, " + window.env.t('welcomeHabitT2'),
      }, {
        element: ".main-herobox",
        title: window.env.t('yourAvatar'),
        content: window.env.t('yourAvatarText'),
      }, {
        element: ".main-herobox",
        title: window.env.t('avatarCustom'),
        content: window.env.t('avatarCustomText'),
      }, {
        element: ".hero-stats",
        title: window.env.t('hitPoints'),
        content: window.env.t('hitPointsText'),
      }, {
        element: ".hero-stats",
        title: window.env.t('expPoints'),
        content: window.env.t('expPointsText'),
      }, {
        element: "ul.habits",
        title: window.env.t('typeGoals'),
        content: window.env.t('typeGoalsText'),
        placement: "top"
      }, {
        element: "ul.habits",
        title: window.env.t('habits'),
        content: window.env.t('tourHabits'),
        placement: "top"
      }, {
        element: "ul.dailys",
        title: window.env.t('dailies'),
        content: window.env.t('tourDailies'),
        placement: "top"
      }, {
        element: "ul.todos",
        title: window.env.t('todos'),
        content: window.env.t('tourTodos'),
        placement: "top",
      }, {
        element: "ul.main-list.rewards",
        title: window.env.t('rewards'),
        content: window.env.t('tourRewards'),
        placement: "top"
      }, {
        element: "ul.habits li:first-child",
        title: window.env.t('hoverOver'),
        content: window.env.t('hoverOverText'),
        placement: "right"
      }, {
        orphan:true,
        title: window.env.t('unlockFeatures'),
        content: window.env.t('unlockFeaturesT1') + " <a href='http://habitrpg.wikia.com' target='_blank'>" + window.env.t('habitWiki') + "</a> " + window.env.t('unlockFeaturesT2'),
        placement: "right"
      }
    ];
    $('.main-herobox').popover('destroy');
    var tour = new Tour({
      backdrop: true,
      //orphan: true,
      //keyboard: false,
      template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-default" data-role="end">' + window.env.t('endTour') + '</button> </div> </div>',
      onEnd: function(){
        User.set({'flags.showTour': false});
      }
    });
    _.each(tourSteps, function(step) {
      step.content = "<div><div class='" + (env.worldDmg.guide ? "npc_justin_broken" : "npc_justin") + " float-left'></div>" + step.content + "</div>";
      step.onShow = function(){
        // Since all the steps are currently on the tasks page, ensure we go back there for each step in case they
        // clicked elsewhere during the tour. FIXME: $state.go() returns a promise, necessary for async tour steps;
        // however, that's not working here - have to use timeout instead :/
        if (!$state.is('tasks')) return $timeout(function(){$state.go('tasks');}, 0)
      }
      step.html = true;
      tour.addStep(step);
    });
    tour.restart(); // Tour doesn't quite mesh with our handling of flags.showTour, just restart it on page load
    //tour.start(true);
  };

  var alreadyShown = function(before, after) {
    return !(!before && after === true);
  };

  var showPopover = function(selector, title, html, placement) {
    if (!placement) placement = 'bottom';
    $(selector).popover('destroy');
    var button = "<button class='btn btn-sm btn-default' onClick=\"$('" + selector + "').popover('hide');return false;\">" + window.env.t('close') + "</button>";
    if (env.worldDmg.guide) {
      html = "<div><div class='npc_justin_broken float-left'></div>" + html + '<br/>' + button + '</div>';
    } else {
      html = "<div><div class='npc_justin float-left'></div>" + html + '<br/>' + button + '</div>';
    }
    $(selector).popover({
      title: title,
      placement: placement,
      trigger: 'manual',
      html: true,
      content: html
    }).popover('show');
  };

  $rootScope.$watch('user.flags.customizationsNotification', function(after, before) {
    if (alreadyShown(before, after)) return;
    showPopover('.main-herobox', window.env.t('customAvatar'), window.env.t('customAvatarText'), 'bottom');
  });

  $rootScope.$watch('user.flags.itemsEnabled', function(after, before) {
    if (alreadyShown(before, after)) return;
    var html = window.env.t('storeUnlockedText');
    showPopover('div.rewards', window.env.t('storeUnlocked'), html, 'left');
  });

  $rootScope.$watch('user.flags.partyEnabled', function(after, before) {
    if (alreadyShown(before, after)) return;
    var html = window.env.t('partySysText');
    showPopover('.user-menu', window.env.t('partySys'), html, 'bottom');
  });

  $rootScope.$watch('user.flags.dropsEnabled', function(after, before) {
    if (alreadyShown(before, after)) return;
    var eggs = User.user.items.eggs || {};
    if (!eggs) {
      eggs['Wolf'] = 1; // This is also set on the server
    }
    $rootScope.openModal('dropsEnabled');
  });

  $rootScope.$watch('user.flags.rebirthEnabled', function(after, before) {
      if (alreadyShown(before, after)) return;
      $rootScope.openModal('rebirthEnabled');
  });


  /**
   * Classes Tour
   */
  function classesTour(){

    // TODO notice my hack-job `onShow: _.once()` functions. Without these, the syncronous path redirects won't properly handle showing tour
    var tourSteps = [
      {
        path: '/#/options/inventory/equipment',
        onShow: _.once(function(tour){
          $timeout(function(){tour.goTo(0)});
        }),
        element: '.equipment-tab',
        title: window.env.t('classGear'),
        content: window.env.t('classGearText', {klass: User.user.stats.class})
      },
      {
        path: '/#/options/profile/stats',
        onShow: _.once(function(tour){
          $timeout(function(){tour.goTo(1)});
        }),
        element: ".allocate-stats",
        title: window.env.t('stats'),
        content: window.env.t('classStats'),
      }, {
        element: ".auto-allocate",
        title: window.env.t('autoAllocate'),
        placement: 'left',
        content: window.env.t('autoAllocateText'),
      }, {
        element: ".meter.mana",
        title: window.env.t('spells'),
        content: window.env.t('spellsText') + " <a target='_blank' href='http://habitrpg.wikia.com/wiki/Todos'>" + window.env.t('toDo') + "</a>."
      }, {
        orphan: true,
        title: window.env.t('readMore'),
        content: window.env.t('moreClass') + " <a href='http://habitrpg.wikia.com/wiki/Class_System' target='_blank'>Wikia</a>."
      }
    ];
    _.each(tourSteps, function(step){
      if (env.worldDmg.guide) {
        step.content = "<div><div class='npc_justin_broken float-left'></div>" + step.content + "</div>";
      } else {
        step.content = "<div><div class='npc_justin float-left'></div>" + step.content + "</div>";
      }
    });
    $('.allocate-stats').popover('destroy');
    var tour = new Tour({
//        onEnd: function(){
//          User.set({'flags.showTour': false});
//        }
    });
    tourSteps.forEach(function(step) {
      tour.addStep(_.defaults(step, {html: true}));
    });
    tour.restart(); // Tour doesn't quite mesh with our handling of flags.showTour, just restart it on page load
    //tour.start(true);
  };

  return {
    initTour: initTour,
    classesTour: classesTour
  };
}]);
