<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/30/2017 - HAPPY HABITOWEEN!
    hr
    .media
      .media-body
        h3 It's Habitoween!
        p It's the last day of the Fall Festival, and all the NPCs are looking monstrous. Plus, we have lots of fun things in store....
        h3 Jack O' Lantern Pets and Mounts!
        p(v-markdown='"The Flourishing Fields are full of cute carved pumpkins - and it looks like one has [followed you home](/inventory/stable)!"')
        p Each Habitoween, you'll get a new and exciting Jack o'Lantern variety! What kind of Jack o' Lantern? It all depends on how many Habitoweens you've celebrated with us. Happy Fall Festival!
        .small by Lemoness
        h3 Candy for Everyone!
        p(v-markdown='"It\'s a feast for your pets and mounts! In honor of the end of the Fall Festival, we\'ve given everyone an assortment of candy. You can feed it to your pets in the [Stable](/inventory/stable)! Enjoy."')
        .small by SabreCat and Lemoness
      .promo_jackolanterns.left-margin
    h3 Last Chance for Fall Festival Items and Imperious Imp Set
    p This is your last chance to get all Fall Festival items before they vanish at the end of October 31st! This includes Limited-Edition Outfits, Seasonal Shop purchases, Seasonal Edition Skins and Hair Colors, and yes, even Spooky and Ghost Hatching Potions. Grab them all while you still can!
    p(v-markdown='"Plus, today is the final day to [subscribe](/user/settings/subscription) and receive the Imperious Imp Item Set!"')
    p Thanks so much for your supporting the site -- you're helping us keep Habitica alive. Happy Habitoween!
    .small by Lemoness
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
