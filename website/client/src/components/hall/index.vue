<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'contributors'}"
        exact="exact"
        :class="{'active': $route.name === 'contributors'}"
      >
        {{ $t('hallContributors') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'patrons'}"
        :class="{'active': $route.name === 'patrons'}"
      >
        {{ $t('hallPatrons') }}
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
