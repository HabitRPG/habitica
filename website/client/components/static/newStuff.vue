<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/21/2017 - DECEMBER SUBSCRIBER ITEMS, NEW YEAR'S RESOLUTION GUILD AND CHALLENGE, AND HELPFUL HOLIDAY BLOG POSTS
    hr
    .promo_mystery_201712.center-block
    h3 December Subscriber Items Revealed!
    p(v-markdown='"The December Subscriber Item Set has been revealed: [the Candlemancer Item Set](https://habitica.com/#/options/settings/subscription)! You only have 11 days to receive the item set when you subscribe. If you\'re already an active subscriber, reload the site and click Inventory>Items to claim your gear!"')
    p Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.
    .small by Beffymaroo
    h3 New Year's Resolution Guild and Official Challenge
    p(v-markdown='"Get a start on 2018 with extra accountability! The Habitica team has launched our official [New Year\'s Resolution Guild](/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99), which we\'ve designed to be a social hub that will provide support, encouragement, tips, and tricks throughout the entire year. Plus, each month we\'ll be running a special official Challenge designed to help you build resolutions that are destined for success and then stick with them as the year progresses. You can find the first one [here](/challenges/35999b79-ae6a-4f16-9557-b4923498e837)! It has a 15 gem prize, which will be awarded to five lucky winners on February 1st."')
    p We hope that you enjoy our new series of official Challenges!
    .small by beffymaroo, Lemoness, and SabreCat
    .media
      .scene_winter_cleaning.right-margin
      .media-body
        h3 Use Case and Guild Spotlights: Holiday Housekeeping
        p(v-markdown='"This month\'s blog theme is Holiday Housekeeping! Visit our [Use Case Spotlight](https://habitica.wordpress.com/2017/12/18/use-case-spotlight-holiday-housekeeping/) to get suggestions on preparing for holiday festivities, then check out the [Guild Spotlight](https://habitica.wordpress.com/2017/12/20/its-most-wonderful-and-busy-time-of-the-year-guilds-to-help-with-holiday-tasks/) to find communities to support you as you put those ideas into action!"')
        p We're collecting user submissions for the next spotlight! How do you use Habitica to Set Realistic Goals? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!
        .small by Beffymaroo
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

  .bottom-margin {
    margin-bottom: 1em;
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
