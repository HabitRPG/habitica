<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/30/2017 - NEW YEAR'S EVE CELEBRATION! PARTY HATS, NEW YEAR'S CARDS, SNOWBALLS, AND LAST CHANCE FOR CANDLEMANCER ITEM SET
    hr
    .media
      .media-body
        h3 Party Hats!
        p In honor of the new year, some free Party Hats are available in your Rewards! Each year you celebrate New Year's with Habitica, you unlock a new hat. Enjoy, and stay tuned for the matching robes in late January during our annual Habitica Birthday Bash!
        .small by Lemoness, Beffymaroo, and SabreCat
      .promo_nye_seasonal_shop.left-margin
    .media
      .promo_nye_card.right-margin
      .media-body
        h3 New Year's Cards (Until Jan 1st Only!)
        p(v-markdown='"Until January 1st only, the [Market](/shops/market) is stocking New Year\'s Cards! Now you can send cards to your friends (and yourself) to wish them a Happy Habit New Year. All senders and recipients will receive the Auld Acquaintance badge!"')
    .small by Lemoness and SabreCat
    .media
      .media-body
        h3 Snowballs
        p(v-markdown='"The [Seasonal Shop](/shops/seasonal) is stocking Snowballs for gold! Throw them at your friends to have an exciting effect. If you get hit with a snowball, you earn the Annoying Friends badge. The results of being hit with a Snowball will last until the end of your day, but you can also reverse them early by buying Salt from the Rewards column. Snowballs are available until January 31st."')
        .small by Shaner and Lemoness
      .promo_snowball.left-margin
    h3 Last Chance for Candlemancer Armor
    p(v-markdown='"Reminder: the 31st is the final day to [subscribe](/user/settings/subscription) and receive the Candlemancer Armor Set! Subscribing also lets you buy gems for gold, nets you our exclusive Jackalope Pet, and has tons of other great perks! Don\'t forget we\'re also running our Gift-One-Get-One subscription deal right now, so it\'s the perfect time to try out a subscription with a friend or family member!"')
    p Thanks so much for your support! You help keep Habitica running.
    .small by Beffymaroo
    .promo_mystery_201712.center-block
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
