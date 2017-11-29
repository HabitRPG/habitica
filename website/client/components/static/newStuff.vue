<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 11/29/2017 - LAST CHANCE FOR CARPET RIDER SET AND THUNDERSTORM POTIONS, GUILD AND USE CASE SPOTLIGHTS
    hr
    .media
      .promo_potions_thunderstorm.right-margin
      .media-body
        h3 Last Chance for Carpet Rider Set
        p(v-markdown='"Reminder: there are only two more days to [subscribe](/user/settings/subscription) and receive the Carpet Rider Set! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!"')
        p Thanks so much for your support! You help keep Habitica running.
        .small by Beffymaroo
        h3 Last Chance for Thunderstorm Hatching Potions
        p(v-markdown='"Reminder: this is the final day to [buy Thunderstorm Hatching Potions!](/shops/market) If they come back, it won\'t be until next year at the earliest, so don\'t delay!"')
        .small by Balduranne
        h3 Generating Interest: Guilds and Use Cases for Money Matters
        p(v-markdown='"There\'s a new [Guild Spotlight on the blog](https://habitica.wordpress.com/2017/11/28/generating-interest-guilds-for-money-matters/) that highlights the Guilds that can help you as work to improve your budgeting and saving habits! Check it out now to find Habitica\'s best money management communities."')
    .media
      .media-body
        p(v-markdown='"This month\'s [Use Case Spotlight](https://habitica.wordpress.com/2017/11/14/3908/) follows the same theme! It features a number of great suggestions submitted by Habiticans in the [Use Case Spotlights Guild](https://habitica.com/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6). We hope it helps any of you who might be working on saving and budgeting as the holiday season approaches!"')
        p Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to stay on top of Holiday Housekeeping? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog at the start of next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!
        .small by Beffymaroo
      .scene_money.left-margin
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
