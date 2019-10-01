<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'myChallenges'}", :class="{'active': $route.name === 'myChallenges'}") {{ $t('myChallenges') }}
    router-link.nav-link(:to="{name: 'findChallenges'}", :class="{'active': $route.name === 'findChallenges'}") {{ $t('findChallenges') }}

  .col-12
    router-view
</template>

<script>
import SecondaryMenu from 'client/components/secondaryMenu';

export default {
  components: {
    SecondaryMenu,
  },
};
</script>
