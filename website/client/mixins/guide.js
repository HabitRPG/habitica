import times from 'lodash/times';
import Intro from 'intro.js/';
import * as Analytics from 'client/libs/analytics';

export default {
  data () {
    return {
      TOUR_END: -2,
      tour: {},
      chapters: {},
      loaded: false,
    };
  },
  watch: {
    $route () {
      this.routeChange();
    },
  },
  methods: {
    initTour () {
      if (this.loaded) return;
      this.chapters = {
        intro: [
          [
            {
              intro: this.$t('introTour'),
              scrollTo: 'tooltip',
            },
          ],
        ],
        classes: [
          [
            {
              orphan: true,
              intro: this.$t('classGearText'),
              final: true,
              state: 'options.inventory.equipment',
              element: '.weapon',
              title: this.$t('classGear'),
              hideNavigation: true,
            },
          ],
        ],
        stats: [[
          {
            orphan: true,
            intro: this.$t('tourStatsPage'),
            final: true,
            proceed: this.$t('tourOkay'),
            hideNavigation: true,
          },
        ]],
        tavern: [[
          {
            orphan: true,
            intro: this.$t('tourTavernPage'),
            final: true,
            proceed: this.$t('tourAwesome'),
            hideNavigation: true,
          },
        ]],
        party: [[
          {
            orphan: true,
            intro: this.$t('tourPartyPage'),
            final: true,
            proceed: this.$t('tourSplendid'),
            hideNavigation: true,
          },
        ]],
        guilds: [[
          {
            intro: this.$t('tourGuildsPage'),
          },
        ]],
        challenges: [[
          {
            intro: this.$t('tourChallengesPage'),
          },
        ]],
        market: [[
          {
            intro: this.$t('tourMarketPage'),
          },
        ]],
        hall: [[
          {
            intro: this.$t('tourHallPage'),
          },
        ]],
        pets: [[
          {
            intro: this.$t('tourPetsPage'),
          },
        ]],
        mounts: [[
          {
            intro: this.$t('tourMountsPage'),
          },
        ]],
        equipment: [[
          {
            intro: this.$t('tourEquipmentPage'),
          },
        ]],
      };

      for (let key in this.chapters) {
        let chapter = this.chapters[key][0][0];
        chapter.intro = `
          <div class='featured-label'>
            <span class='rectangle'></span>
            <span class='text'> Justin </span>
            <span class='rectangle'></span>
          </div>
          <div class='npc_justin_textbox'>
          </div>
          ${chapter.intro}`;
      }

      this.loaded = true;
    },
    routeChange () {
      this.initTour();
      switch (this.$route.name) {
        // case 'options.profile.avatar':   return goto('intro', 5);
        case 'stats':        return this.goto('stats', 0);
        case 'tavern':        return this.goto('tavern', 0);
        case 'party':         return this.goto('party', 0);
        case 'guildsDiscovery': return this.goto('guilds', 0);
        case 'challenges':    return this.goto('challenges', 0);
        case 'patrons':   return this.goto('hall', 0);
        case 'items':      return this.goto('market', 0);
        case 'stable':       return this.goto('pets', 0);
        // @TODO: same page now case 'stable':     return this.goto('mounts', 0);
        case 'equipment':  return this.goto('equipment', 0);
      }
    },
    hoyo (user) {
      // @TODO: What is was the timeout for?
      // @TODO move to analytics
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

      let opts = {}; // @TODO: chap._options;
      opts.steps = [];
      page += 1;
      times(page, (p) => {
        opts.steps  = opts.steps.concat(this.chapters[chapter][p]);
      });

      Analytics.track({
        hitType: 'event',
        eventCategory: 'behavior',
        eventAction: 'tutorial',
        eventLabel: `${chapter}-web`,
        eventValue: page + 1,
        complete: true,
      });

      // @TODO: Do we always need to initialize here?
      let intro = Intro.introJs();
      intro.setOptions({
        steps: opts.steps,
        doneLabel: this.$t('letsgo'),
      });
      intro.start();
      intro.oncomplete(() => {
        this.markTourComplete(chapter);
      });
    },
    markTourComplete (chapter) {
      let ups = {};
      let lastKnownStep = this.user.flags.tour[chapter];

      // Return early if user has already completed this tutorial
      if (lastKnownStep === -2) {
        return;
      }

      // if (true) { // -2 indicates complete
      //   if (chapter === 'intro') {
      //     // Manually show bunny scroll reward
      //     // let rewardData = {
      //     //   reward: [Shared.content.quests.dustbunnies],
      //     //   rewardKey: ['inventory_quest_scroll_dustbunnies'],
      //     //   rewardText: Shared.content.quests.dustbunnies.text(),
      //     //   message: this.$t('checkinEarned'),
      //     //   nextRewardAt: 1,
      //     // };
      //     // @TODO: Notification.showLoginIncentive(this.user, rewardData, Social.loadWidgets);
      //   }

      // Mark tour complete
      ups[`flags.tour.${chapter}`] = -2; // @TODO: Move magic numbers to enum

      Analytics.track({
        hitType: 'event',
        eventCategory: 'behavior',
        eventAction: 'tutorial',
        eventLabel: `${chapter}-web`,
        eventValue: lastKnownStep,
        complete: true,
      });
      // }

      this.$store.dispatch('user:set', ups);
    },
  },
};
