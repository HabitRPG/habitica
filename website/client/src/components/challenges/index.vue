<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'myChallenges'}"
        :class="{'active': $route.name === 'myChallenges'}"
      >
        {{ $t('myChallenges') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'findChallenges'}"
        :class="{'active': $route.name === 'findChallenges'}"
      >
        {{ $t('findChallenges') }}
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
