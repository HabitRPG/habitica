<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/30/2018 - HABITICA BIRTHDAY CELEBRATION, LAST CHANCE FOR WINTER WONDERLAND ITEMS, AND CONTINUED RESOLUTION PLOT-LINE
    hr
    .promo_habit_birthday_2018.center-block
    h3 Habitica Birthday Party!
    p January 31st is Habitica's Birthday! Thank you so much for being a part of our community - it means a lot.
    p Now come join us and the NPCs as we celebrate!
    h4 Cake for Everybody!
    p(v-markdown='"In honor of the festivities, everyone has been awarded an assortment of yummy cake to feed to your pets! Plus, for the next two days [Alexander the Merchant](/shops/market) is selling cake in his shop, and cake will sometimes drop when you complete your tasks. Cake works just like normal pet food, but if you want to know what type of pet likes each slice, [the wiki has spoilers](http://habitica.wikia.com/wiki/Food)."')
    h4 Party Robes
    p There are Party Robes available for free in the Rewards column! Don them with pride.
    h4 Birthday Bash Achievement
    p In honor of Habitica's birthday, everyone has been awarded the Habitica Birthday Bash achievement! This achievement stacks for each Birthday Bash you celebrate with us.
    .media
      .media-body
        h3 Last Chance for Frost Sprite Set
        p(v-markdown='"Reminder: this is the final day to [subscribe](/user/settings/subscription) and receive the Frost Sprite Set! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!"')
        p Thanks so much for your support! You help keep Habitica running.
        .small by Beffymaroo
        h3 Last Chance for Starry Night and Holly Hatching Potions
        p(v-markdown='"Reminder: this is the final day to [buy Starry Night and Holly Hatching Potions!](/shops/market) If they come back, it won\'t be until next year at the earliest, so don\'t delay!"')
        .small by Vampitch, JinjooHat, Lemoness, and SabreCat
        h3 Resolution Plot-Line: Broken Buildings
        p Lemoness, SabreCat, and Beffymaroo call an important meeting to address the rumors that are flying about this strange outbreak of Habiticans who are suddenly losing all faith in their ability to complete their New Year's Resolutions.
        p “Thank you all for coming,” Lemoness says. “I'm afraid that we have some very serious news to share, but we ask that you remain calm.”
      .promo_starry_potions.left-margin
    p “While it's natural to feel a little disheartened as the end of January approaches,” Beffymaroo says, “these sudden outbreaks appear to have some strange magical origin. We're still investigating the exact cause, but we do know that the buildings where the affected Habiticans live often seem to sustain some damage immediately before the attack.”
    p SabreCat clears his throat. “For this reason, we strongly encourage everyone to stay away from broken-down structures, and if you feel any strange tremors or hear odd sounds, please report them immediately.”
    p(v-markdown='"“Stay safe, Habiticans.” Lemoness flashes her best comforting smile. “And remember that if your New Year\'s Resolution goals seem daunting, you can always seek support in the [New Year\'s Resolution Guild](https://habitica.com/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99).”"')
    p How mysterious! Hopefully they'll get to the bottom of this soon.
    hr
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
