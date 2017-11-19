<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 11/17/2017 - THANKSGIVING IN HABITICA, NOVEMBER SUBSCRIBER ITEMS, AND ANDROID UPDATE
    hr
    .media
      .promo_turkey_day_2017.right-margin
      .media-body.d-flex.align-self-center.flex-column
        h3 Happy Thanksgiving!
        p It's Thanksgiving in Habitica! On this day Habiticans celebrate by spending time with loved ones, giving thanks, and riding their glorious turkeys into the magnificent sunset. Some of the NPCs are celebrating the occasion!
        h3 Turkey Pets, Mounts, and Costume!
        p For the occasion, all Habiticans have received Turkey-themed items! What items? It all depends on how many Habitica Thanksgivings you've celebrated with us. Each Thanksgiving, you'll get a new and exciting Turkey pet, mount, or gear set! Check your Stable and your pinned Rewards to see what you got!
        p Thank you for using Habitica - we really love you all <3
        .small by Lemoness
    .media
      .media-body
        h3 November Subscriber Items Revealed!
        p(v-markdown='"The November Subscriber Items have been revealed: the [Carpet Rider Item Set](https://habitica.com/user/settings/subscription)! You have until November 30 to receive the item set when you subscribe. If you\'re already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!"')
        p Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.
        .small by Lemoness
      .promo_mystery_201711.left-margin
    h3 Android App Update
    p There’s an exciting new update to our Android app!
    ul
      li We’ve smashed some pesky bugs, including the issue with task reordering!
      li You can now view and assign attribute points (or choose auto-allocation)!
      li We’ve added Equipment to the Market, plus the ability to change your login name and email, reset or delete your account, make changes to your profile, and access Fix Character Values.
      li You can also request a password reset from the login screen!
    p We hope this makes your Habitica experience even better. Be sure to download the update now for a better Habitica experience!
    p If you like the improvements that we’ve been making to our app, please consider reviewing this new version. It really helps us out!
    .small by Viirus and piyorii
    br
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';
  .center-block {
    margin: 0 auto 1em auto;
  }

  .left-margin {
    margin-left: 1em;
  }

  .right-margin {
    margin-right: 1em;
  }

  .small {
    margin-bottom: 1em;
  }
</style>

<script>
  import markdown from 'client/directives/markdown';

  export default {
    data () {
      let worldDmg = {
        bailey: false,
      };

      return {
        baileyClass: {
          'npc_bailey_broken': worldDmg.bailey, // eslint-disable-line
          'npc_bailey': !worldDmg.bailey, // eslint-disable-line
        },
      };
    },
    directives: {
      markdown,
    },
  };
</script>
