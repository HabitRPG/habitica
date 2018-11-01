<template lang="pug">
  b-modal#level-up(:title="$t('levelUpShare')", size='sm', :hide-footer="true", :hide-header="true")
    .modal-body.text-center
      h2 {{ $t('reachedLevel', {level: user.stats.lvl}) }}

      avatar.avatar(:member='user')

      p.text {{ $t('levelup') }}

      stat-allocation#levelUpStatAllocation(
        v-if='!user.preferences.automaticAllocation',
        :user='user',
        :statUpdates='statUpdates',
        @statUpdate='statUpdate')

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
  @import '~client/assets/scss/colors.scss';

  #level-up {
    h2 {
      color: $purple-200;
    }

    .modal-content {
      min-width: 28em;
      background-color: $gray-700;
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
      color: $gray-100;
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
      color: $white;
    }

    .fb-share-button {
      background-color: $blue-10;
    }

    .twitter-share-button {
      margin-right: .5em;
      background-color: $teal-50;
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

  #levelUpStatAllocation {
    font-size: 12px;
    margin-bottom: 1em;

    .minimize {
      padding: 0px 5px 0px 5px;
    }

    h3 {
      font-size: 14px;
    }

    .counter.badge {
      position: relative;
      top: -0.5em;
      left: 0.25em;
      color: $white;
      background-color: $orange-100;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 10px;
      padding: 2px;
    }

    .box {
      max-width: 80px;
      margin: 0 auto;
      padding: .5em;
      font-size: 11px;

      .stat-title {
        width: 100%;
        height: 20px;
        line-height: 20px;
      }

      div {
        padding: 0;
      }

      .number {
        font-size: 24px;
        color: $gray-100;
        display: inline-block;
      }

      .points {
        display: inline-block;
        font-weight: bold;
        color: $gray-200;
        margin-left: .5em;
      }
    }
  }
</style>

<style lang='scss' scoped>
  .avatar {
    margin-left: 6.8em;
  }
</style>

<script>
import Avatar from '../avatar';
import statAllocation from '../userMenu/statAllocation';

import { mapState } from 'client/libs/store';
import allocateBulk from  'common/script/ops/stats/allocateBulk';
import {maxHealth} from 'common/script/index';
import styleHelper from 'client/mixins/styleHelper';
import twitter from 'assets/svg/twitter.svg';
import facebook from 'assets/svg/facebook.svg';
import axios from 'axios';

let BASE_URL = 'https://habitica.com';

export default {
  mixins: [styleHelper],
  components: {
    Avatar,
    statAllocation,
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
      statUpdates: {
        str: 0,
        int: 0,
        con: 0,
        per: 0,
      },
    };
  },
  mounted () {
    this.loadWidgets();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    showAllocation () {
      return this.$store.getters['members:hasClass'](this.user) && !this.user.preferences.automaticAllocation;
    },
  },
  methods: {
    statUpdate (stat, delta) {
      this.statUpdates[stat] += delta;
    },
    close () {
      for (const stat in this.statUpdates) {
        if (this.statUpdates[stat] > 0) {
          allocateBulk(this.user, { body: { stats: this.statUpdates } });

          axios.post('/api/v4/user/allocate-bulk', {
            stats: this.statUpdates,
          });
        }
      }
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
