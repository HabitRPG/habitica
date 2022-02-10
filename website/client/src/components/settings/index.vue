<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'site'}"
        exact="exact"
        :class="{'active': $route.name === 'site'}"
      >
        {{ $t('site') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'api'}"
        :class="{'active': $route.name === 'api'}"
      >
        {{ $t('API') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'dataExport'}"
        :class="{'active': $route.name === 'dataExport'}"
      >
        {{ $t('dataExport') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'promoCode'}"
        :class="{'active': $route.name === 'promoCode'}"
      >
        {{ $t('promoCode') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'subscription'}"
        :class="{'active': $route.name === 'subscription'}"
      >
        {{ $t('subscription') }}
      </router-link>
      <router-link
        v-if="hasPermission(user, 'userSupport')"
        class="nav-link"
        :to="{name: 'transactions'}"
        :class="{'active': $route.name === 'transactions'}"
      >
        {{ $t('transactions') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'notifications'}"
        :class="{'active': $route.name === 'notifications'}"
      >
        {{ $t('notifications') }}
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
    <div class="col-12">
      <router-view />
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
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import SecondaryMenu from '@/components/secondaryMenu';
import gifts from '@/assets/svg/gifts-vertical.svg';
import { userStateMixin } from '../../mixins/userState';

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
  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
  },
};
</script>
