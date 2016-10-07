'use strict';

/**
 * Services for each tour step when you unlock features
 */

angular.module('habitrpg').factory('Guide',
['$rootScope', 'User', '$timeout', '$state', 'Analytics',
function($rootScope, User, $timeout, $state, Analytics) {

  var chapters = {
    intro: [
      [
        {
          state: 'options.profile.avatar',
          element: '.tab-content.ng-scope',
          content: window.env.t('tourAvatar'),
          placement: "top",
          proceed: window.env.t('tourAvatarProceed'),
          backdrop: false,
          orphan: true,
          gold: 4,
          experience: 29
        },
        {
          state: 'tasks',
          element: ".task-column.todos",
          content: window.env.t('tourToDosBrief'),
          placement: "top",
          proceed: window.env.t('tourOkay'),
          gold: 4,
          experience: 29
        },
        {
          state: 'tasks',
          element: ".task-column.dailys",
          content: window.env.t('tourDailiesBrief'),
          placement: "top",
          proceed: window.env.t('tourDailiesProceed'),
          gold: 4,
          experience: 29
        },
        {
          state: 'tasks',
          element: ".task-column.habits",
          content: window.env.t('tourHabitsBrief'),
          placement: "top",
          proceed: window.env.t('tourHabitsProceed'),
          gold: 4,
          experience: 29
        },
        {
          state: 'tasks',
          element: "h2.task-column_title.reward-title",
          content: User.user.flags.armoireEnabled ? window.env.t('tourRewardsArmoire') : window.env.t('tourRewardsBrief'),
          placement: "left",
          proceed: window.env.t('tourRewardsProceed'),
          gold: 4,
          experience: 29,
          final: true
        }
      ]
    ],
    classes: [
      [
        {
          state: 'options.inventory.equipment',
          element: '.equipment-tab',
          title: window.env.t('classGear'),
          content: window.env.t('classGearText')
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
          content: window.env.t('spellsText')
        }, {
          orphan: true,
          title: window.env.t('readMore'),
          content: window.env.t('moreClass'),
          final: true
        }
      ]
    ],
    stats: [[
      {
        orphan: true,
        content: window.env.t('tourStatsPage'),
        final: true,
        proceed: window.env.t('tourOkay'),
        hideNavigation: true
      }
    ]],
    tavern: [[
      {
        orphan: true,
        content: window.env.t('tourTavernPage'),
        final: true,
        proceed: window.env.t('tourAwesome'),
        hideNavigation: true
      }
    ]],
    party: [[
      {
        orphan: true,
        content: window.env.t('tourPartyPage'),
        final: true,
        proceed: window.env.t('tourSplendid'),
        hideNavigation: true
      }
    ]],
    guilds: [[
      {
        orphan: true,
        content: window.env.t('tourGuildsPage'),
        final: true,
        proceed: window.env.t('tourNifty'),
        hideNavigation: true
      }
    ]],
    challenges: [[
      {
        orphan: true,
        content: window.env.t('tourChallengesPage'),
        final: true,
        proceed: window.env.t('tourOkay'),
        hideNavigation: true
      }
    ]],
    market: [[
      {
        orphan: true,
        content: window.env.t('tourMarketPage'),
        final: true,
        proceed: window.env.t('tourAwesome'),
        hideNavigation: true
      }
    ]],
    hall: [[
      {
        orphan: true,
        content: window.env.t('tourHallPage'),
        final: true,
        proceed: window.env.t('tourSplendid'),
        hideNavigation: true
      }
    ]],
    pets: [[
      {
        orphan: true,
        content: window.env.t('tourPetsPage'),
        final: true,
        proceed: window.env.t('tourNifty'),
        hideNavigation: true
      }
    ]],
    mounts: [[
      {
        orphan: true,
        content: window.env.t('tourMountsPage'),
        final: true,
        proceed: window.env.t('tourOkay'),
        hideNavigation: true
      }
    ]],
    equipment: [[
      {
        orphan: true,
        content: window.env.t('tourEquipmentPage'),
        final: true,
        proceed: window.env.t('tourAwesome'),
        hideNavigation: true
      }
    ]]
  }

  _.each(chapters, function(chapter, k){
    _(chapter).flattenDeep().each(function(step, i) {
      step.content = "<div><div class='" + (env.worldDmg.guide ? "npc_justin_broken" : "npc_justin") + " float-left'></div>" + step.content + "</div>";
      $(step.element).popover('destroy'); // destroy existing hover popovers so we can add our own
      step.onShow = function(){
        Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'tutorial','eventLabel':k+'-web','eventValue':i+1,'complete':false});
        if (step.state && !$state.is(step.state)) {
          $state.go(step.state);
          return $timeout(function(){});
        }
      };
      step.onHide = function(){
        var ups = {};
        var lastKnownStep = User.user.flags.tour[k];

        // Return early if user has already completed this tutorial
        if (lastKnownStep === -2) {
          return;
        }
        if (i > lastKnownStep) {
          if (step.gold) ups['stats.gp'] = User.user.stats.gp + step.gold;
          if (step.experience) ups['stats.exp'] = User.user.stats.exp + step.experience;
          ups['flags.tour.'+k] = i;
        }
        if (step.final) { // -2 indicates complete
          ups['flags.tour.'+k] = -2;
          Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'tutorial','eventLabel':k+'-web','eventValue':i+1,'complete':true})
        }

        User.set(ups);
        // User.set() doesn't include a check for level changes, so manually check here.
        if (step.experience) {
          User.user.fns.updateStats(User.user.stats);
        }
      }
    }).value();
  });

  var tour = {};
  _.each(chapters, function(v,k){
    tour[k] = new Tour({
      name: k,
      backdrop: true,
      template: function(i,step){
        var showFinish = step.final || k == 'classes';
        var showCounter = k=='intro' && !step.final;

        return '<div class="popover" role="tooltip">' +
          '<div class="arrow"></div>' +
          '<h3 class="popover-title"></h3>' +
          '<div class="popover-content"></div>' +
          '<div class="popover-navigation"> ' +
            (showCounter ? '<span style="float:right;">'+ (i+1 +' of '+ _.flattenDeep(chapters[k]).length) +'</span>' : '')+ // counter
            '<div class="btn-group">' +
              (step.hideNavigation ? '' : '<button class="btn btn-sm btn-default" data-role="prev">&laquo; Previous</button>') +
              (showFinish ? ('<button class="btn btn-sm btn-primary" data-role="end" style="float:none;">' + (step.proceed ? step.proceed : "Finish Tour") + '</button>') :
                (step.hideNavigation ? '' : ('<button class="btn btn-sm btn-primary" data-role="next">' + (step.proceed ? step.proceed : "Next") + ' &raquo;</button>'))) +
              '<button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button>' +
            '</div>' +
          '</div>' +
          '</div>';
      },
      storage: false
    });
  });

  var goto = function(chapter, page, force) {
    if (chapter == 'intro' && User.user.flags.welcomed != true) User.set({'flags.welcomed': true});
    if (page === -1) page = 0;
    var curr = User.user.flags.tour[chapter];
    if (page != curr+1 && !force) return;
    var chap = tour[chapter], opts = chap._options;
    opts.steps = [];
    _.times(page, function(p){
      opts.steps  = opts.steps.concat(chapters[chapter][p]);
    })
    var end = opts.steps.length;
    opts.steps = opts.steps.concat(chapters[chapter][page]);
    chap._removeState('end');
    if (chap._inited) {
      chap.goTo(end);
    } else {
      chap.setCurrentStep(end);
      if (page > 0) {
        chap.init();
        chap.goTo(page);
      } else {
        chap.start();
      }
    }
  }

  //Init and show the welcome tour (only after user is pulled from server & wrapped).
  var watcher = $rootScope.$watch('User.user._wrapped', function(wrapped){
    if (!wrapped) return; // only run after user has been wrapped
    watcher(); // deregister watcher
    if (window.env.IS_MOBILE) return; // Don't show tour immediately on mobile devices
    if (User.user.flags.welcomed == false) {
      $rootScope.openModal('welcome', {size: 'lg', backdrop: 'static', keyboard: false});
    }

    var alreadyShown = function(before, after) { return !(!before && after === true) };
    //$rootScope.$watch('user.flags.dropsEnabled', _.flow(alreadyShown, function(already) { //FIXME requires lodash@~3.2.0
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      switch (toState.name) {
        // case 'options.profile.avatar':   return goto('intro', 5);
        case 'options.profile.stats':        return goto('stats', 0);
        case 'options.social.tavern':        return goto('tavern', 0);
        case 'options.social.party':         return goto('party', 0);
        case 'options.social.guilds.public': return goto('guilds', 0);
        case 'options.social.challenges':    return goto('challenges', 0);
        case 'options.social.hall.heroes':   return goto('hall', 0);
        case 'options.inventory.drops':      return goto('market', 0);
        case 'options.inventory.pets':       return goto('pets', 0);
        case 'options.inventory.mounts':     return goto('mounts', 0);
        case 'options.inventory.equipment':  return goto('equipment', 0);
      }
    });
  });

  var Guide = {
    goto: goto
  };
  $rootScope.Guide = Guide;
  return Guide;

}]);
