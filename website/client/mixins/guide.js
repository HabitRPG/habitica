import each from 'lodash/each';
import flattenDeep from 'lodash/flattenDeep';
import times from 'lodash/times';
import Tour from 'bootstrap-tour';
import Intro from 'intro.js/';

export default {
  data () {
    return {
      tour: {},
      chapters: {},
    };
  },
  methods: {
    load () {
      // @TODO: this should be called after app is loaded
      // Init and show the welcome tour (only after user is pulled from server & wrapped).
      if (window.env.IS_MOBILE) return; // Don't show tour immediately on mobile devices

      // let alreadyShown = (before, after) => {
      //   return Boolean(!before && after === true);
      // };
      // $rootScope.$watch('user.flags.dropsEnabled', _.flow(alreadyShown, function(already) { //FIXME requires lodash@~3.2.0
    },
    initTour () {
      this.chapters = {
        intro: [
          [
            {
              // state: 'options.profile.avatar',
              element: '.member-details',
              intro: this.$t('tourAvatar'),
              // placement: 'top',
              // proceed: this.$t('tourAvatarProceed'),
              // backdrop: false,
              // orphan: true,
              // gold: 4,
              // experience: 29,
            },
            {
              // state: 'tasks',
              element: '.todo',
              intro: this.$t('tourToDosBrief'),
              placement: 'top',
              // proceed: this.$t('tourOkay'),
              // gold: 4,
              // experience: 29,
            },
            {
              // state: 'tasks',
              element: '.daily',
              intro: this.$t('tourDailiesBrief'),
              placement: 'top',
              // proceed: this.$t('tourDailiesProceed'),
              // gold: 4,
              // experience: 29,
            },
            {
              // state: 'tasks',
              element: '.habit',
              intro: this.$t('tourHabitsBrief'),
              placement: 'top',
              // proceed: this.$t('tourHabitsProceed'),
              // gold: 4,
              // experience: 29,
            },
            {
              // state: 'tasks',
              element: '.reward',
              intro: this.user.flags.armoireEnabled ? this.$t('tourRewardsArmoire') : this.$t('tourRewardsBrief'),
              placement: 'left',
              // proceed: this.$t('tourRewardsProceed'),
              // gold: 4,
              // experience: 29,
              // final: true,
            },
          ],
        ],
        classes: [
          [
            {
              orphan: true,
              content: this.$t('classGearText'),
              final: true,
              state: 'options.inventory.equipment',
              element: '.equipment-tab',
              title: this.$t('classGear'),
              hideNavigation: true,
            },
          ],
        ],
        stats: [[
          {
            orphan: true,
            content: this.$t('tourStatsPage'),
            final: true,
            proceed: this.$t('tourOkay'),
            hideNavigation: true,
          },
        ]],
        tavern: [[
          {
            orphan: true,
            content: this.$t('tourTavernPage'),
            final: true,
            proceed: this.$t('tourAwesome'),
            hideNavigation: true,
          },
        ]],
        party: [[
          {
            orphan: true,
            content: this.$t('tourPartyPage'),
            final: true,
            proceed: this.$t('tourSplendid'),
            hideNavigation: true,
          },
        ]],
        guilds: [[
          {
            orphan: true,
            content: this.$t('tourGuildsPage'),
            final: true,
            proceed: this.$t('tourNifty'),
            hideNavigation: true,
          },
        ]],
        challenges: [[
          {
            orphan: true,
            content: this.$t('tourChallengesPage'),
            final: true,
            proceed: this.$t('tourOkay'),
            hideNavigation: true,
          },
        ]],
        market: [[
          {
            orphan: true,
            content: this.$t('tourMarketPage'),
            final: true,
            proceed: this.$t('tourAwesome'),
            hideNavigation: true,
          },
        ]],
        hall: [[
          {
            orphan: true,
            content: this.$t('tourHallPage'),
            final: true,
            proceed: this.$t('tourSplendid'),
            hideNavigation: true,
          },
        ]],
        pets: [[
          {
            orphan: true,
            content: this.$t('tourPetsPage'),
            final: true,
            proceed: this.$t('tourNifty'),
            hideNavigation: true,
          },
        ]],
        mounts: [[
          {
            orphan: true,
            content: this.$t('tourMountsPage'),
            final: true,
            proceed: this.$t('tourOkay'),
            hideNavigation: true,
          },
        ]],
        equipment: [[
          {
            orphan: true,
            content: this.$t('tourEquipmentPage'),
            final: true,
            proceed: this.$t('tourAwesome'),
            hideNavigation: true,
          },
        ]],
      };
      let chapters = this.chapters;
      each(chapters, (chapter, k) => {
        flattenDeep(chapter).forEach((step, i) => {
          // @TODO: (env.worldDmg.guide ? 'npc_justin_broken' : 'npc_justin')
          step.content = `<div><div class='npc_justin float-left'></div>${step.content}</div>`;
          // @TODO: $(step.element).popover('destroy'); // destroy existing hover popovers so we can add our own

          step.onShow = () => {
            // @TODO: Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'tutorial','eventLabel':k+'-web','eventValue':i+1,'complete':false});
            // @TODO: Add Router if (!step.state || $state.is(step.state)) return;
            // @TODO: Add Router $state.go(step.state);
            // @TODO: Do we need this? return $timeout(() => {});
          };

          step.onHide = () => {
            let ups = {};
            let lastKnownStep = this.user.flags.tour[k];

            // Return early if user has already completed this tutorial
            if (lastKnownStep === -2) {
              return;
            }

            if (i > lastKnownStep) {
              if (step.gold) ups['stats.gp'] = this.user.stats.gp + step.gold;
              if (step.experience) ups['stats.exp'] = this.user.stats.exp + step.experience;
              ups[`flags.tour.${k}`] = i;
            }

            if (step.final) { // -2 indicates complete
              if (k === 'intro') {
                // Manually show bunny scroll reward
                // let rewardData = {
                //   reward: [Shared.content.quests.dustbunnies],
                //   rewardKey: ['inventory_quest_scroll_dustbunnies'],
                //   rewardText: Shared.content.quests.dustbunnies.text(),
                //   message: this.$t('checkinEarned'),
                //   nextRewardAt: 1,
                // };
                // @TODO: Notification.showLoginIncentive(this.user, rewardData, Social.loadWidgets);
              }

              // Mark tour complete
              ups[`flags.tour.${k}`] = -2; // @TODO: Move magic numbers to enum
              // @TODO: Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'tutorial','eventLabel':k+'-web','eventValue':i+1,'complete':true})
            }

            this.set(ups);
            // User.set() doesn't include a check for level changes, so manually check here.
            if (step.experience) {
              this.user.fns.updateStats(this.user.stats);
            }
          };
        });
      });

      let tour = this.tour;
      each(chapters, (v, k) => {
        tour[k] = new Tour({
          name: k,
          backdrop: true,
          template: (i, step) => {
            let showFinish = step.final || k === 'classes';
            let showCounter = k === 'intro' && !step.final;
            // TODO: we can probably create a component for all this

            let counterSpan = '';
            if (showCounter) counterSpan = `<span style="float:right;">${i + 1} of ${flattenDeep(chapters[k]).length}</span>`;

            let prevButton = '';
            if (!step.hideNavigation) prevButton = '<button class="btn btn-sm btn-default" data-role="prev">&laquo; Previous</button>';

            let nextButton = '';
            let stepProceedText = 'Next';
            if (step.proceed) stepProceedText = step.proceed;
            if (!step.hideNavigation) nextButton = `<button class="btn btn-sm btn-primary" data-role="next">${stepProceedText} &raquo;</button>`;
            let stepFinishText = 'Finish Tour';
            if (step.proceed) stepFinishText = step.proceed;
            if (showFinish) nextButton = `<button class="btn btn-sm btn-primary" data-role="end" style="float:none;">${stepFinishText}</button>`;

            return `<div class="popover" role="tooltip"> \
              <div class="arrow"></div> \
              <h3 class="popover-title"></h3> \
              <div class="popover-content"></div> \
              <div class="popover-navigation"> \
                ${counterSpan} \
                <div class="btn-group"> \
                  ${prevButton} \
                  ${nextButton} \
                  <button class="btn btn-sm btn-default" \
                  data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> \
              </div> \
              </div> \
              </div>`;
          },
          storage: false,
        });
      });
    },
    // @TODO: should this be a watch? Global Vue.Route?
    routeChange (toState) {
      // @TODO: old params: event, toState, toParams, fromState, fromParams
      switch (toState.name) {
        // case 'options.profile.avatar':   return goto('intro', 5);
        case 'options.profile.stats':        return this.goto('stats', 0);
        case 'options.social.tavern':        return this.goto('tavern', 0);
        case 'options.social.party':         return this.goto('party', 0);
        case 'options.social.guilds.public': return this.goto('guilds', 0);
        case 'options.social.challenges':    return this.goto('challenges', 0);
        case 'options.social.hall.heroes':   return this.goto('hall', 0);
        case 'options.inventory.drops':      return this.goto('market', 0);
        case 'options.inventory.pets':       return this.goto('pets', 0);
        case 'options.inventory.mounts':     return this.goto('mounts', 0);
        case 'options.inventory.equipment':  return this.goto('equipment', 0);
      }
    },
    hoyo (user) {
      // @TODO: What is was the timeout for?
      window.amplitude.setUserId(user._id);
      window.ga('set', {userId: user._id});
    },
    goto (chapter, page, force) {
      if (chapter === 'intro' && this.user.flags.welcomed !== true)  {
        // @TODO: Add dispatch User.set({'flags.welcomed': true});
      }
      if (chapter === 'classes' && this.user.flags.tour.classes === -2) return;
      if (page === -1) page = 0;
      let curr = this.user.flags.tour[chapter];
      if (page !== curr + 1 && !force) return;
      let chap = this.tour[chapter];
      let opts = chap._options;
      opts.steps = [];

      times(page, (p) => {
        opts.steps  = opts.steps.concat(this.chapters[chapter][p]);
      });

      // let end = opts.steps.length;
      // opts.steps = opts.steps.concat(this.chapters[chapter][page]);
      // chap._removeState('end');

      // @TODO: Do we always need to initialize here?
      let intro = Intro.introJs();
      intro.setOptions({steps: opts.steps});
      intro.start();

      // if (chap._inited) {
      //   chap.goTo(end);
      // } else {
      //   chap.setCurrentStep(end);
      //   if (page > 0) {
      //     chap.init();
      //     chap.goTo(page);
      //   } else {
      //     chap.start();
      //   }
      // }
    },
  },
};
