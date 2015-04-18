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
    ],
    stats: [[
      {
        orphan: true,
        content: window.env.t('tourStatsPage'),
        final: true
      }
    ]],
    tavern: [[
      {
        orphan: true,
        content: window.env.t('tourTavernPage'),
        final: true
      }
    ]],
    party: [[
      {
        orphan: true,
        content: window.env.t('tourPartyPage'),
        final: true
      }
    ]],
    guilds: [[
      {
        orphan: true,
        content: window.env.t('tourGuildsPage'),
        final: true
      }
    ]],
    challenges: [[
      {
        orphan: true,
        content: window.env.t('tourChallengesPage'),
        final: true
      }
    ]],
    market: [[
      {
        orphan: true,
        content: window.env.t('tourMarketPage'),
        final: true
      }
    ]]
  }

  _.each(chapters, function(chapter, k){
    _(chapter).flatten().each(function(step, i) {
      step.content = "<div><div class='" + (env.worldDmg.guide ? "npc_justin_broken" : "npc_justin") + " float-left'></div>" + step.content + "</div>";
      $(step.element).popover('destroy'); // destroy existing hover popovers so we can add our own
      step.onShow = function(){
        // step.path doesn't work in Angular do to async ui-router. Our custom solution:
        if (step.state && !$state.is(step.state)) {
          // $state.go() returns a promise, necessary for async tour steps; however, that's not working here - have to use timeout instead :/
          $state.go(step.state);
          return $timeout(function(){});
        }
        window.ga && ga('send', 'event', 'behavior', 'tour', k, i+1);
      }
      step.onHide = function(){
        if (step.final) { // -2 indicates complete
          var ups={};ups['flags.tour.'+k] = -2;
          User.set(ups);
        }
      }
    })
  })

  var tour = {};
  _.each(chapters, function(v,k){
    tour[k] = new Tour({
      name: k,
      backdrop: true,
      template: function(i,step){
        var showFinish = step.final || k == 'classes';
        var showCounter = k=='intro' && !step.final;

        $rootScope.variant=2; // temporarily set finish & counter on until we can get experiment working

        // Experiment wud1Ba5qT1m9qR3PP0-Mmg , remove this when experiment complete
        // 0=No Finish; Yes Counter 1=No Finish; No Counter 2=Yes Finish; Yes Counter 3=Yes Finish; No Counter
        showFinish = showFinish || $rootScope.variant==2 || $rootScope.variant==3;
        showCounter = showCounter && ($rootScope.variant==0 || $rootScope.variant==2);

        return '<div class="popover" role="tooltip">' +
          '<div class="arrow"></div>' +
          '<h3 class="popover-title"></h3>' +
          '<div class="popover-content"></div>' +
          '<div class="popover-navigation"> ' +
            //'<button class="btn btn-sm btn-default" data-role="end" style="float:none;">' + (step.final ? 'Finish Tour' : 'Hide') + '</button>' +
            (showFinish ? '<button class="btn btn-sm btn-default" data-role="end" style="float:none;">Finish Tour</button>' : '') +
            (showCounter ? '<span style="float:right;">'+ (i+1 +' of '+ _.flatten(chapters[k]).length) +'</span>' : '')+ // counter
            '<div class="btn-group">' +
              '<button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button>' +
              '<button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button>' +
              '<button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button>' +
            '</div>' +
          '</div>' +
          '</div>';
      },
      storage: false,
      //onEnd: function(){
      //  User.set({'flags.showTour': false});
      //}
    });
  });

  var goto = function(chapter, page, force) {
    var curr = User.user.flags.tour[chapter];
    if (page != curr+1 && !force) return;
    var updates = {};updates['flags.tour.'+chapter] = page;
    User.set(updates);
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
      chap.start();
    }
  }

  //Init and show the welcome tour (only after user is pulled from server & wrapped).
  var watcher = $rootScope.$watch('User.user.ops.update', function(updateFn){
    if (!updateFn) return; // only run after user has been wrapped
    watcher(); // deregister watcher
    if (window.env.IS_MOBILE) return; // Don't show tour immediately on mobile devices
    goto('intro', 0); // kick off first step on first visit

    var alreadyShown = function(before, after) { return !(!before && after === true) };
    //$rootScope.$watch('user.flags.dropsEnabled', _.flow(alreadyShown, function(already) { //FIXME requires lodash@~3.2.0
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      switch (toState.name) {
        case 'options.profile.avatar':   return goto('intro', 5);
        case 'options.profile.stats':    return goto('stats', 0);
        case 'options.social.tavern':    return goto('tavern', 0);
        case 'options.social.party':     return goto('party', 0);
        case 'options.social.guilds':    return goto('guilds', 0);
        case 'options.social.challenges':return goto('challenges', 0);
        case 'options.inventory.drops':  return goto('market', 0);
      }
    })
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

  var Guide = {
    goto: goto
  };
  $rootScope.Guide = Guide;
  return Guide;

}]);
