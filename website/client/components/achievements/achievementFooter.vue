<template lang="pug">
.modal-footer(style='margin-top:0', ng-init='loadWidgets()')
  .container-fluid.share-buttons
    .row
      .col-12.text-center
        a.twitter-share-button.share-button(:href='twitterLink', target='_blank')
          .social-icon.twitter.svg-icon(v-html='icons.twitter')
          | {{ $t('tweet') }}
        a.fb-share-button.share-button(:href='facebookLink', target='_blank')
          .social-icon.facebook.svg-icon(v-html='icons.facebook')
          | {{ $t('share') }}
        // @TODO: Still want this? .col-4
          a.tumblr-share-button(:data-href='socialLevelLink', data-notes='none')
</template>

<style scoped>
  .share-buttons {
    margin-top: 1em;
    margin-bottom: 1em;
  }

  .share-button {
    display: inline-block;
    width: 77px;
    padding: .5em;
    border-radius: 2px;
    text-align: center;
    color: #fff;
  }

  .fb-share-button {
    background-color: #2995cd;
  }

  .twitter-share-button {
    margin-right: .5em;
    background-color: #3bcad7;
  }

  .social-icon {
    width: 16px;
    display: inline-block;
    vertical-align: bottom;
    margin-right: .5em;
  }

  .social-icon.facebook svg {
    width: 7.5px;
    margin-bottom: .2em;
  }

  .social-icon.twitter {
    margin-bottom: .2em;
  }
</style>

<script>
// @TODO:
let BASE_URL = 'https://habitica.com';
import twitter from 'assets/svg/twitter.svg';
import facebook from 'assets/svg/facebook.svg';

export default {
  data () {
    let tweet = this.$t('achievementShare');

    return {
      icons: Object.freeze({
        twitter,
        facebook,
      }),
      tweet,
      achievementLink: `${BASE_URL}/social/achievement`,
      twitterLink: `https://twitter.com/intent/tweet?text=${tweet}&via=habitica&url=${BASE_URL}/social/achievement&count=none`,
      facebookLink: `https://www.facebook.com/sharer/sharer.php?text=${tweet}&u=${BASE_URL}/social/achievement`,
    };
  },
};
</script>
