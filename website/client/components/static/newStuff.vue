<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/10/2018 - iOS APP STORE FEATURE, NEW PET QUEST, AND LAST CHANCE FOR BUY-1-GET-1 GIFT SUBSCRIPTIONS
    hr
    .media
      .media-body
        h3 Habitica App Store Feature!
        p(v-markdown='"We\'re honored to be featured as the App of the Day in the iOS App Store! [Check out our story here](https://itunes.apple.com/us/story/id1328100123)."')
        p Also, get excited because we're releasing an update to the Habitica iOS App in the very near future that includes a number of highly requested features! We'll be announcing this update very soon, so keep an eye out for it!
        .small by Viirus and piyorii
      .promo_itunes_appday.left-margin
    .media
      .quest_pterodactyl.right-margin
      .media-body
        h3 New Pet Quest: The Pterror-Dactyl!
        p(v-markdown='"A hike along the Stoïkalm Cliffs turns terrifying when a Pterror-dactyl hones in on undone Dailies and negative Habits! Can you defeat this reptilian menace with your productivity? Get the latest pet quest, [The Pterror-dactyl](/shops/quests), and earn some trusting Pterodactyl pets by completing your real-life tasks."')
        .small by SabreCat, Lemoness, and Beffymaroo
        .small Written by FrenchKey
        .small Art by Lilith of Alfheim, Vampitch, Procyon P, GeraldThePixel, Edge, stefalupagus, Katy133, Willow the Witty
    .media
      .media-body
        h3 Last Chance to Gift a Subscription and Get One Free!
        p Tomorrow is your last chance to take advantage of our promotion where if you gift somebody a subscription, you get the same subscription for yourself for free!
        p Subscribers get tons of perks every month, including exclusive items, the ability to buy gems with gold, a cute exclusive Jackalope Pet, and increased data history. Plus, it helps keep Habitica running :) To gift a subscription to someone, just open their profile and click on the present icon in the upper right.
      .promo_bogo.left-margin
    p The special promotion will only run until tomorrow, so if you've been curious about trying out a subscription, now's the time! Make a friend happy and use all your new gems to go questing together.
    p Please note that if you or your gift recipient already have a recurring subscription, the gifted subscription will only start after that subscription is cancelled or has expired. Thanks so much for your support! <3
    .small by SabreCat and Lemoness
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
