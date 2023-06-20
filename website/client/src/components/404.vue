<template>
  <div class="row">
    <div class="col-6 text-center mx-auto mb-5">
      <!-- @TODO i18n. How to setup the strings with the router-link inside?-->
      <img
        :class="retiredChatPage ? 'mt-5' : 'image-404'"
        src="~@/assets/images/404.png"
      >
      <div v-if="retiredChatPage">
        <h1>
          {{ $t('tavernDiscontinued') }}
        </h1>
        <p>{{ $t('tavernDiscontinuedDetail') }}</p>
        <p v-html="$t('tavernDiscontinuedLinks')"></p>
      </div>
      <div v-else>
        <h1>
          Sometimes even the bravest adventurer gets lost.
        </h1>
        <p class="mb-0">
          Looks like this link is broken or the page may have moved, sorry!
        </p>
        <p>
          Head back to the
          <router-link to="/">
            Homepage
          </router-link>or
          <router-link :to="contactUsLink">
            Contact Us
          </router-link>about the issue.
        </p>
      </div>
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
    retiredChatPage () {
      return this.$route.fullPath.indexOf('/groups') !== -1;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

h1, .static-wrapper h1 {
  color: $purple-200;
  line-height: 1.33;
  margin-top: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 16px;
  line-height: 1.75;
}

.image-404 {
  margin-top: 104px;
}

</style>
