<template lang="pug">
.row
  challenge-modal
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'myChallenges'}", :class="{'active': $route.name === 'myChallenges'}") {{ $t('myChallenges') }}
    router-link.nav-link(:to="{name: 'findChallenges'}", :class="{'active': $route.name === 'findChallenges'}") {{ $t('findChallenges') }}

  .col-12
    router-view
</template>

<script>
import SecondaryMenu from 'client/components/secondaryMenu';
import ChallengeModal from './ChallengeModal';

export default {
  components: {
    SecondaryMenu,
    ChallengeModal,
  },
};
</script>
