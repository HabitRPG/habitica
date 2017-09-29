<template lang="pug">
  b-modal#new-stuff(
    v-if='user.flags.newStuff',
    size='lg',
    :hide-header='true',
    :hide-footer='true',
  )
    .modal-body
      .media
        .align-self-center.right-margin(:class='baileyClass')
        .media-body
          h1.align-self-center(v-markdown='$t("newStuff")')
      h2 9/28/2017 - HABITICA'S WEBSITE LEVELS UP!
      hr
      p Welcome to the new Habitica! We're so excited to share it with you at last. This project, which has been a labor of love since last December, is the single biggest update that Habitica has ever released (with over 150 pages of designs, an entire rewrite of all of our front-end code, countless rounds of testing and iteration, and many, many meetings). Just refresh your page to load the new website!
      .promo_login_screen.center-block
      p(v-markdown="'You can find a full list of changes [here](http://habitica.wikia.com/wiki/Habitica_Redesign_Fact_Sheet), as well as explanations for why we made each, but here are a few quick tips to help you get oriented:'")
      .grassy-meadow-backdrop
        .daniel_front
      ul
        li There's a ton of new art around the site! Peek at the NPCs and Guild chats to admire some of the changes.
        li Click directly on your tasks to bring up the edit modal!
        li The navigation bar contains several changes to be more intuitive for new users, so we recommend taking some time to open the drop-down menus and familiarize yourself with the new locations. Notably, the User menu has moved to an icon in the upper-right corner.
        li You can now pin any purchasable item in the game to your Rewards. You can pin Backgrounds, too! Just hover over the shop icon and click the pin. When you head back to the tasks page, you'll see it in your Rewards column!
        li There are lots of new filtering options, especially for Guilds and Challenges!
        li There are visual upgrades for every aspect of the site, from the front page to the Seasonal Shop. We hope that you like them!
        li Some of these upgrades have made their way to our <a href='https://itunes.apple.com/us/app/habitica/id994882113?ls=1&mt=8' target='_blank'>iOS</a> and <a href='https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica' target='_blank'>Android</a> apps! Be sure to download the latest updates for the best performance.
      .seasonal-shop-backdrop
        .sorceress_front
      p Have general questions about how the new site works? Come ask in the <a href='https://habitica.com/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a'>Habitica Help Guild</a>, and we'll be glad to assist! Likewise, if you encounter a persistent bug that isn't fixed by refreshing your page, you can report it in the <a href='https://habitica.com/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac'>Report a Bug Guild</a> and we will investigate as soon as possible.
      p If you have thoughts about the new design, we look forward to hearing them. On <strong>October 12th</strong> we will be opening a Trello card for public comments on the redesign. This delay will give us time to focus our attention on answering general questions and fixing any bugs that might arise. For this reason, we ask that you hold back on sharing your feedback about the new designs until that Trello card is live and linked in a Bailey announcement. Thanks for understanding!
      .promo_veteran_pets_2017.center-block
      p This is a major time of change for Habitica, so to thank you for your patience, we've given everyone a Veteran Pet! Newer users have received a Veteran Wolf, and older users have received (depending on which pets they already had) a Veteran Tiger, a Veteran Lion, or a Veteran Bear. Head to the new <a href='https://habitica.com/inventory/stable'>Stable</a> page and filter to the Special Pets section to see the latest addition to your menagerie!"')
      p We are so excited to continue to build Habitica with you. Now go check it out!
      p Thank you for playing, and good luck with your tasks <3
      .small by Apollo, piyorii, TheHollidayInn, Paglias, Negue, Sabe, Alys, viirus, Lemoness, redphoenix, beffymaroo, and all our awesome testers!
      br
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-default(@click='close()') {{ this.$t('cool') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

  .center-block {
    margin: 0 auto;
  }

  .grassy-meadow-backdrop {
    background-image: url('~assets/images/npc/fall/tavern_background.png');
    background-repeat: repeat-x;
    width: 100%;
    height: 246px;
  }

  .daniel_front {
    background-image: url('~assets/images/npc/fall/tavern_npc.png');
    height: 246px;
    width: 471px;
    background-repeat: no-repeat;
    margin: 0 auto;
  }

  .seasonal-shop-backdrop {
    background: url('~assets/images/npc/fall/seasonal_shop_opened_background.png');
    background-repeat: repeat-x;
  }

  .sorceress_front {
    background-image: url('~assets/images/npc/fall/seasonal_shop_opened_npc.png');
    height: 246px;
    width: 471px;
    background-repeat: no-repeat;
    margin: 0 auto;
  }

  .modal-body {
    padding-top: 2em;
  }

  .left-margin {
    margin-left: 1em;
  }

  .right-margin {
    margin-right: 1em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapState } from 'client/libs/store';
import markdown from 'client/directives/markdown';

export default {
  components: {
    bModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  data () {
    let worldDmg = {
      bailey: false,
    };

    return {
      baileyClass: {
        'npc_bailey_broken': worldDmg.bailey, // eslint-disable-line
        'npc_bailey': !worldDmg.bailey, // eslint-disable-line
      },
    };
  },
  directives: {
    markdown,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'new-stuff');
    },
    dismissAlert () {
      this.$store.dispatch('user:set', {'flags.newStuff': false});
      this.close();
    },
  },
};
</script>
