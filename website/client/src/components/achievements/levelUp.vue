<template>
  <b-modal
    id="level-up"
    :title="$t('levelUpShare')"
    size="sm"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="modal-body text-center">
      <h2>{{ $t('reachedLevel', {level: user.stats.lvl}) }}</h2>
      <avatar
        class="avatar"
        :member="user"
      />
      <p class="text">
        {{ $t('levelup') }}
      </p>
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
      <br>
      <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
label(style='display:inline-block') {{ $t('dontShowAgain') }}
      -->
    </div>
    <div class="container-fluid share-buttons">
      <div class="row">
        <div class="col-12 text-center">
          <a
            class="twitter-share-button share-button"
            :href="twitterLink"
            target="_blank"
          >
            <div
              class="social-icon twitter svg-icon"
              v-html="icons.twitter"
            ></div>
            {{ $t('tweet') }}
          </a>
          <a
            class="fb-share-button share-button"
            :href="facebookLink"
            target="_blank"
          >
            <div
              class="social-icon facebook svg-icon"
              v-html="icons.facebook"
            ></div>
            {{ $t('share') }}
          </a>
        </div>
        <!-- @TODO: Still want this? .col-4a.tumblr
          -share-button(:data-href='socialLevelLink', data-notes='none')-->
      </div>
    </div>
  </b-modal>
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
import { mapState } from '@/libs/store';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';
import styleHelper from '@/mixins/styleHelper';
import twitter from '@/assets/svg/twitter.svg';
import facebook from '@/assets/svg/facebook.svg';

const BASE_URL = 'https://habitica.com';

export default {
  components: {
    Avatar,
  },
  mixins: [styleHelper],
  data () {
    const tweet = this.$t('levelUpShare');
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
  computed: {
    ...mapState({ user: 'user.data' }),
    showAllocation () {
      return this.$store.getters['members:hasClass'](this.user) && !this.user.preferences.automaticAllocation;
    },
  },
  mounted () {
    this.loadWidgets();
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'level-up');
    },
    loadWidgets () {
      // @TODO:
    },
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp":
      // user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
