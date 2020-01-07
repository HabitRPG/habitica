<template>
  <div class="row">
    <navbar
      class="secondary-menu col-12"
      :items="tabs"
      router-links
    />
    <div class="col-12">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/ui/simpleNavbar';

export default {
  components: {
    Navbar,
  },
  computed: {
    tabs () {
      // get tabs from routes?
      return [
        {
          title: 'myChallenges',
          name: 'myChallenges',
        },
        {
          title: 'findChallenges',
          name: 'findChallenges',
        },
      ];
    },
  },
};
</script>
