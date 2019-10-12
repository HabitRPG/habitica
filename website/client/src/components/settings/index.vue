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
        class="nav-link"
        :to="{name: 'notifications'}"
        :class="{'active': $route.name === 'notifications'}"
      >
        {{ $t('notifications') }}
      </router-link>
    </secondary-menu>
    <div class="col-12">
      <router-view />
    </div>
  </div>
</template>

<script>
import SecondaryMenu from '@/components/secondaryMenu';

export default {
  components: {
    SecondaryMenu,
  },
};
</script>
