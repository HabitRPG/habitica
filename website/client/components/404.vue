<template lang="pug">
.row
  .col-12.text-center
    // @TODO i18n. How to setup the strings with the router-link inside?
    img.not-found-img(src='~assets/images/404.png')
    h1.not-found Sometimes even the bravest adventurer gets lost. 
    h2.not-found Looks like this link is broken or the page may have moved, sorry! 
    h2.not-found Head back to the <router-link to="/">Homepage</router-link> or <router-link :to="contactUsLink">Contact Us</router-link> about the issue.
</template>

<script>
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState(['isUserLoggedIn']),
    contactUsLink () {
      if (this.isUserLoggedIn) {
        return {name: 'guild', params: {groupId: '5481ccf3-5d2d-48a9-a871-70a7380cee5a'} };
      } else {
        return {name: 'contact'};
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

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