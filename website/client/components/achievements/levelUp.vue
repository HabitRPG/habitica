<template lang="pug">
  b-modal#level-up(:title="$t('levelUpShare')", size='sm', :hide-footer="true", :hide-header="true")
    .modal-body.text-center
      h2 {{ $t('reachedLevel', {level: user.stats.lvl}) }}

      avatar.avatar(:member='user')

      p.text {{ $t('levelup') }}

      stat-allocation(
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

  #statAllocation {
    .title-row {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .counter.badge {
      position: relative;
      top: -0.25em;
      left: 0.5em;
      color: #fff;
      background-color: #ff944c;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .box {
      width: 148px;
      height: 84px;
      padding: .5em;
      margin: 0 auto;

      div {
        margin-top: 0;
      }

      .number {
        font-size: 40px;
        text-align: left;
        color: #686274;
        display: inline-block;
      }

      .points {
        display: inline-block;
        font-weight: bold;
        line-height: 1.67;
        text-align: left;
        color: #878190;
        margin-left: .5em;
      }

      .up, .down {
        border: solid #a5a1ac;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
      }

      .up:hover, .down:hover {
        cursor: pointer;
      }

      .up {
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
        margin-top: 1em;
      }

      .down {
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
    }

    .white {
      border-radius: 2px;
      background: #FFFFFF;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
      border: 1px solid transparent;
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
