<template>
  <div class="row">
    <div class="col-12 text-center">
      <!-- @TODO i18n. How to setup the strings with the router-link inside?-->
      <img
        class="not-found-img"
        src="~@/assets/images/404.png"
      >
      <h1 class="not-found">
        Sometimes even the bravest adventurer gets lost.
      </h1>
      <h2 class="not-found">
        Looks like this link is broken or the page may have moved, sorry!
      </h2>
      <h2 class="not-found">
        Head back to the
        <router-link to="/">
          Homepage
        </router-link>or
        <router-link :to="contactUsLink">
          Contact Us
        </router-link>about the issue.
      </h2>
    </div>
  </div>
</template>

<script>
import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState(['isUserLoggedIn']),
    contactUsLink () {
      if (this.isUserLoggedIn) {
        return { name: 'guild', params: { groupId: 'a29da26b-37de-4a71-b0c6-48e72a900dac' } };
      }
      return { name: 'contact' };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.col-12 {
  margin-bottom: 120px;
}

.not-found-img {
  margin-top: 152px;
  margin-bottom: 42px;
}

h1.not-found {
  line-height: 1.33;
  color: $purple-200;
  margin-bottom: 8px;
  font-weight: normal;
  margin-top: 0px;
}

h2.not-found {
  line-height: 1.4;
  font-weight: normal;
  color: $gray-200;
  margin-bottom: 0px;
  margin-top: 0px;
}
</style>
