<template lang="pug">
.modal-footer(style='margin-top:0', ng-init='loadWidgets()')
  .container-fluid
    .row.text-center
      .col-4
        a.twitter-share-button(:href='twitterLink') {{ $t('tweet') }}
      .col-4
        .fb-share-button(:data-href='achievementLink', data-layout='button')
      .col-4
        a.tumblr-share-button(:data-href='achievementLink', data-notes='none')
</template>

<script>
// @TODO:
let BASE_URL = 'https://habitica.com';

export default {
  data () {
    let tweet = this.$t('achievementShare');

    return {
      tweet,
      achievementLink: `${BASE_URL}/social/achievement`,
      twitterLink: `https://twitter.com/intent/tweet?text=${tweet}&via=habitica&url=${BASE_URL}/social/achievement&count=none`,
    };
  },
};
</script>
