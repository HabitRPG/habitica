import times from 'lodash/times';
import introjs from 'intro.js';

let showingTour = false;

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
      if (showingTour) return;
      showingTour = true;
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
        party: [[
          {
            orphan: true,
            intro: this.$t('tourPartyPage'),
            final: true,
            proceed: this.$t('tourSplendid'),
            hideNavigation: true,
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

      for (const key of Object.keys(this.chapters)) {
        const chapter = this.chapters[key][0][0];
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

      switch (this.$route.name) { // eslint-disable-line default-case
        // case 'options.profile.avatar':   return goto('intro', 5);
        case 'stats': return this.goto('stats', 0);
        case 'party': return this.goto('party', 0);
        case 'challenges': return this.goto('challenges', 0);
        case 'patrons': return this.goto('hall', 0);
        case 'items': return this.goto('market', 0);
        case 'stable': return this.goto('pets', 0);
        // @TODO: same page now case 'stable':     return this.goto('mounts', 0);
        case 'equipment': return this.goto('equipment', 0);
      }

      return null;
    },
    goto (chapter, page, force) {
      if (chapter === 'intro' && this.user.flags.welcomed !== true) {
        // @TODO: Add dispatch User.set({'flags.welcomed': true});
      }
      if (chapter === 'classes' && this.user.flags.tour.classes === -2) return;
      if (page === -1) page = 0; // eslint-disable-line no-param-reassign
      const curr = this.user.flags.tour[chapter];
      if (page !== curr + 1 && !force) return;

      const opts = {}; // @TODO: chap._options;
      opts.steps = [];
      page += 1; // eslint-disable-line no-param-reassign
      times(page, p => {
        opts.steps = opts.steps.concat(this.chapters[chapter][p]);
      });

      // @TODO: Do we always need to initialize here?
      const intro = introjs();
      intro.setOptions({
        exitOnOverlayClick: false,
        steps: opts.steps,
        doneLabel: this.$t('letsgo'),
        buttonClass: 'btn btn-small btn-primary',
      });
      intro.start();
      intro.oncomplete(() => {
        showingTour = false;
        this.markTourComplete(chapter);
      });
    },
    markTourComplete (chapter) {
      const ups = {};
      const lastKnownStep = this.user.flags.tour[chapter];

      // Return early if user has already completed this tutorial
      if (lastKnownStep === -2) {
        return;
      }

      // Mark tour complete
      ups[`flags.tour.${chapter}`] = -2; // @TODO: Move magic numbers to enum

      this.$store.dispatch('user:set', ups);
    },
  },
};
