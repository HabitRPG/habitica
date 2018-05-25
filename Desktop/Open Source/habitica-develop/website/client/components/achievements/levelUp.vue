<template lang="pug">
  b-modal#level-up(:title="$t('levelUpShare')", size='sm', :hide-footer="true", :hide-header="true")
    .modal-body.text-center
      h2 {{ $t('reachedLevel', {level: user.stats.lvl}) }}

      avatar.avatar(:member='user')

      p.text {{ $t('levelup') }}

      button.btn.btn-primary(@click='close()') {{ $t('onwards') }}
      br
      // @TODO: Keep this? .checkbox
        input(type='checkbox', v-model='user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
        label(style='display:inline-block') {{ $t('dontShowAgain') }}

    .container-fluid.share-buttons
      .row
        .col-12.text-center
          a.twitter-share-button.share-button(:href='twitterLink', target='_blank')
            .social-icon.twitter.svg-icon(v-html='icons.twitter')
            | {{ $t('tweet') }}
          a.fb-share-button.share-button(:href='facebookLink', target='_blank')
            .social-icon.facebook.svg-icon(v-html='icons.facebook')
            | {{ $t('share') }}
        // @TODO: Still want this? .col-4
          a.tumblr-share-button(:data-href='socialLevelLink', data-notes='none')
</template>

<style lang="scss">
  #level-up {
    h2 {
      color: #4f2a93;
    }

    .modal-content {
      min-width: 28em;
    }

    .modal-body {
      padding-top: 1em;
      padding-bottom: 0;
    }

    .modal-footer {
      margin-top: 0;
    }

    .herobox {
      margin: auto 8.3em;
      width: 6em;
      height: 9em;
      padding-top: 0;
      cursor: default;
    }

    .character-sprites {
      margin: 0;
      width: 0;
    }

    .text {
      font-size: 14px;
      text-align: center;
      color: #686274;
      margin-top: 1em;
      min-height: 0px;
    }

    .share-buttons {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .share-button {
      display: inline-block;
      width: 77px;
      padding: .5em;
      border-radius: 2px;
      text-align: center;
      color: #fff;
    }

    .fb-share-button {
      background-color: #2995cd;
    }

    .twitter-share-button {
      margin-right: .5em;
      background-color: #3bcad7;
    }

    .social-icon {
      width: 16px;
      display: inline-block;
      vertical-align: bottom;
      margin-right: .5em;
    }

    .social-icon.facebook svg {
      width: 7.5px;
      margin-bottom: .2em;
    }

    .social-icon.twitter {
      margin-bottom: .2em;
    }
  }
</style>

<style scoped>
  .avatar {
    margin-left: 6.8em;
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
import {maxHealth} from '../../../common/script/index';
import styleHelper from 'client/mixins/styleHelper';
import twitter from 'assets/svg/twitter.svg';
import facebook from 'assets/svg/facebook.svg';

let BASE_URL = 'https://habitica.com';

export default {
  mixins: [styleHelper],
  components: {
    Avatar,
  },
  data () {
    let tweet = this.$t('levelUpShare');
    return {
      icons: Object.freeze({
        twitter,
        facebook,
      }),
      statsAllocationBoxIsOpen: true,
      maxHealth,
      tweet,
      socialLevelLink: `${BASE_URL}/social/level-up`,
      twitterLink: `https://twitter.com/intent/tweet?text=${tweet}&via=habitica&url=${BASE_URL}/social/level-up&count=none`,
      facebookLink: `https://www.facebook.com/sharer/sharer.php?text=${tweet}&u=${BASE_URL}/social/level-up`,
    };
  },
  mounted () {
    this.loadWidgets();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    showAllocation () {
      return this.user.flags.classSelected && !this.user.preferences.disableClasses && !this.user.preferences.automaticAllocation;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'level-up');
    },
    loadWidgets () {
      // @TODO:
    },
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp": user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
