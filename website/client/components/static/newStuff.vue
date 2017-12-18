<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/15/2017 - NEW PET QUEST BUNDLE, GIFT-1-GET-1 SUBSCRIPTIONS, AND BEHIND THE SCENES BLOG
    hr
    h3 New Discounted Pet Quest Bundle: Winter Quests
    .media
      .media-body
        p(v-markdown='"If you are looking to add some cold weather friends to your Habitica stable, you\'re in luck! From now until December 31, you can purchase the Winter Quest Bundle and receive the Trapper Santa, Find the Cub, and Penguin quests, all for only 7 Gems! That\'s a discount of 5 Gems from the price of purchasing them separately. Check it out in the [Quest Shop](/shops/quests) today!"')
        .small by Lemoness and SabreCat
        .small Art by UncommonCriminal, Shaner, Eevachu, Pandoro, melynnrose, Breadstrings, Rattify, and PainterProphet
        .small Writing by Lefnire, Leephon, and Daniel the Bard
        .media
          .promo_winter_subscriptions.left-margin
          .media-body
            h3 Gift a Subscription and Get One Free!
            p In honor of the season of giving--and due to popular demand!--we're bringing back a very special promotion for the next month only. Now when you gift somebody a subscription, you get the same subscription for yourself for free!
        p Subscribers get tons of perks every month, including exclusive items, the ability to buy gems with gold, a cute exclusive Jackalope Pet, and increased data history. Plus, it helps keep Habitica running :) To gift a subscription to someone, just open their profile and click on the present icon in the upper right.
      .promo_winter_quests
    p The special promotion will only run until January 12th, so if you've been curious about trying out a subscription, now's the time! Make a friend happy and use all your new gems to go questing together.
    p Please note that if you or your gift recipient already have a recurring subscription, the gifted subscription will only start after that subscription is cancelled or has expired. Thanks so much for your support! <3
    .small by SabreCat and Lemoness
    h3 Behind the Scenes: Habitica's Winter Staff Retreat
    p(v-markdown='"There\'s a new [Behind the Scenes post on the Habitica blog](https://habitica.wordpress.com/2017/12/14/behind-the-scenes-habiticas-winter-staff-retreat/) about our recent Staff Retreat. Check out some great photos and anecdotes from the trip, and learn a little more about the Habitica Team!"')
    .promo_winter_retreat.center-block
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
