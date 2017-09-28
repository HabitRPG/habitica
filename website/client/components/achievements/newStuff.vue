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
      h2 9/1/2017 - NEW TAKE THIS CHALLENGE
      hr
      .media
        .media-body
          h3 September Take This Challenge: Hero's Triumph!
          p The next Take This Challenge has launched, "<a href='/challenges/422cdd93-e822-441e-a203-a36843a24d93'>Hero's Triumph!</a>", with a focus on volunteerism. Be sure to check it out to earn additional pieces of the Take This armor set!
        .promo_takeThis_gear.align-self-center.left-margin
      p <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.
      p Congratulations to the winners of the last Take This Challenge, "Keep Calm and Carry On!": grand prize winner wakupedia, and runners-up Sarah Blake, Drago Nar, secretlondon, Birgitte, and LifeChanging! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a>, if they hadn't completed the set already. It is located in your Rewards column. Enjoy!
      .small by Doctor B, the Take This team, Lemoness, and SabreCat
      br
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
