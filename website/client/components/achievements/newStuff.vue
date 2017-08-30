<template lang="pug">
  b-modal#new-stuff(
    v-if='user.flags.newStuff',
    size='lg',
    :hide-header='true',
    :hide-footer='true',
  )
    .modal-body
      .media
        .media-body
          .media
            .align-self-center.right-margin(:class='baileyClass')
            .media-body
              h1.align-self-center(v-markdown='$t("newStuff")')
          h2 8/30/2017 - LAST CHANCE FOR LAVA WARRIOR SET AND EMBER HATCHING POTIONS
          hr
          .media
            .promo_mystery_201708.right-margin.align-self-center
            .media-body
              h3 Last Chance for Lava Warrior Set
              p Reminder: you only have three days to <a href='/settings/subscription'>subscribe</a> and receive the Lava Warrior Set! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!
              p Thanks so much for your support! You help keep Habitica running.
              p.small.muted by Lemoness
          h3 Last Chance for Ember Hatching Potions
          p Reminder: there are three days left to <a href='/shops/market'>buy Ember Hatching Potions</a>! If they come back, it won't be until next year at the earliest, so don't delay!
          p.small.muted by Balduranne, tricksy.fox, and SabreCat
        .promo_ember_potions.left-margin.align-self-center
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-default(@click='close()') {{ this.$t('cool') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

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
