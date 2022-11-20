<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        v-for="routePath in tabs"
        :key="routePath"
        class="nav-link"
        :to="{name: routePath}"
        exact="exact"
        :class="{'active': $route.name === routePath}"
      >
        {{ $t(pathTranslateKey(routePath)) }}
      </router-link>
    </secondary-menu>
    <div
      v-if="$route.name === 'subscription' && promo === 'g1g1'"
      class="g1g1-banner d-flex justify-content-center"
      @click="showSelectUser"
    >
      <div
        v-once
        class="svg-icon svg-gifts left-gift"
        v-html="icons.gifts"
      >
      </div>
      <div class="d-flex flex-column align-items-center text-center">
        <strong
          class="mt-auto mb-1"
        > {{ $t('g1g1Event') }} </strong>
        <p
          class="mb-auto"
        >
          {{ $t('g1g1Details') }}
        </p>
      </div>
      <div
        v-once
        class="svg-icon svg-gifts right-gift"
        v-html="icons.gifts"
      >
      </div>
    </div>
    <div class="col-12 d-flex justify-content-center">
      <div :class="{'settings-content': applyNarrowView}">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  strong {
    font-size: 1rem;
    line-height: 1.25;
  }

  .g1g1-banner {
    color: $white;
    width: 100%;
    height: 5.75rem;
    background-image: linear-gradient(90deg, $teal-50 0%, $purple-400 100%);
    cursor: pointer;
  }

  .left-gift {
    margin: auto 3rem auto auto;
  }

  .right-gift {
    margin: auto auto auto 3rem;
    filter: flipH;
    transform: scaleX(-1);
  }

  .svg-gifts {
    width: 3.5rem;
  }

  .settings-content {
    flex: 0 0 684px;
    max-width: unset;

    ::v-deep {
      line-height: 1.71;

      table td {
        padding: 0.5rem;
      }

      table tr.expanded td {
        padding-bottom: 1.5rem;
      }

      .settings-label {
        font-weight: bold;
        color: $gray-50;

        width: 20%;
      }

      .input-area .settings-label {
        width: unset;
      }

      .settings-value {
        color: $gray-50;

        width: auto;
      }

      .settings-button {
        width: 30%;
        text-align: end;
      }

      .dialog-title {
        font-size: 14px;
        font-weight: bold;
        color: $purple-300;

        &.danger {
          color: $maroon-50;
        }
      }

      .dialog-disclaimer {
        color: $gray-50;
      }

      .input-area {
        width: 320px;
        margin: 1rem auto 0;
      }

      .edit-link {
        color: $blue-10 !important;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import SecondaryMenu from '@/components/secondaryMenu';
import gifts from '@/assets/svg/gifts-vertical.svg';
import { userStateMixin } from '@/mixins/userState';

export default {
  components: {
    SecondaryMenu,
  },
  mixins: [userStateMixin],
  data () {
    return {
      icons: Object.freeze({
        gifts,
      }),
      tabs: [
        'general',
        'site',
        'api',
        'dataExport',
        'promoCode',
        'subscription',
        'transactions',
        'notifications',
      ],
    };
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    currentEvent () {
      return find(this.currentEventList, event => Boolean(event.promo));
    },
    promo () {
      if (!this.currentEvent || !this.currentEvent.promo) return 'none';
      return this.currentEvent.promo;
    },
    applyNarrowView () {
      return !['subscription', 'transactions'].includes(this.$route.name);
    },
  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
    pathTranslateKey (path) {
      if (path === 'api') {
        return 'API';
      }
      return path;
    },
  },
};
</script>
