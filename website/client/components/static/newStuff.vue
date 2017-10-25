<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/24/2017 - OCTOBER SUBSCRIBER ITEMS, BATCH BUYING, COSTUME CONTEST REMINDER, AND GUILD SPOTLIGHT
    hr
    .media
      .media-body
        h3 October Subscriber Item Set Revealed!
        p(v-markdown='"The October Subscriber Item Set has been revealed: [the Imperious Imp Item Set](/user/settings/subscription)! You only have seven days to receive the item set when you subscribe. If you\'re already an active subscriber, reload the site and then head to Inventory > Equipment to claim your gear!"')
      .promo_mystery_201710
    p Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.
    .small by Lemoness
    h3 Batch Buying
    p We've added the ability to buy multiple quests, potions, eggs, food items, and saddles at once! Plus, if you're a subscriber, you can also buy multiple gems with gold. Batch buying is available in the shops as well as through your pinned Rewards. We hope this makes buying rewards and items even more motivating!
    .small by TheHollidayInn and Apollo
    h3 Community Costume Challenge Reminder
    p(v-markdown='"There\'s just one week left to enter and complete the [Community Costume Challenge!](/challenges/76c69212-4f33-4198-81a8-ffeb51b16b8c) If you\'d like, you can also share your entry with fellow Habiticans on social media by using the hashtag #HabitoweenCostume. Join in the fun now for a chance to win the coveted Costume Contestant Badge!"')
    .scene_positivity.center-block
    h3 Guild Spotlight: Gatherings of Good Cheer
    p(v-markdown='"There\'s a new [Guild Spotlight on the blog](https://habitica.wordpress.com/2017/10/24/gatherings-of-good-cheer-guilds-for-cultivating-positivity/) that highlights the Guilds that can help you as you work toward a more optimistic outlook! Check it out now to find Habitica\'s best communities for Cultivating Positivity."')
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
